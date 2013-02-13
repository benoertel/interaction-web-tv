$(document).ready(function(){
    var helper = new Helper();
    
    $.couch.urlPrefix = couchdbUri;

    $(window).bind('hashchange', hashChanged);

    setupWebsocket();

    function setupWebsocket() {
        websocket = new WebSocket(websocketUri);
        websocket.onopen = onWebsocketOpen;
        websocket.onerror = onWebsocketError;
        websocket.onclose = onWebsocketClose;
    }

    function onWebsocketOpen(event) {
        hashChanged();
        updateChannelList();
        showForm('contentFreetextTemplate');
        updateWebsocketStatus('connected');
    }

    function onWebsocketClose(event) {
        updateWebsocketStatus('disconnected');
        window.setTimeout(function() {
            setupWebsocket()
        }, 5000);
    }

    function onWebsocketError(event) {
        alert('error');
    }

    function updateWebsocketStatus(status) {
        if(status == 'connected') {
            $('#websocket-status i').removeClass('gicon-ws-signal-off');
            $('#websocket-status i').addClass('gicon-ws-signal-on');
            $('#websocket-status').attr('data-status', 'connected');
            $('#websocket-status').attr('data-original-title', 'connection established');

        } else if(status == 'disconnected') {
            $('#websocket-status i').removeClass('gicon-ws-signal-on');
            $('#websocket-status i').addClass('gicon-ws-signal-off');
            $('#websocket-status').attr('data-status', 'disconnected');
            $('#websocket-status').attr('data-original-title', 'no connection');
        }
    }

    function hashChanged() {
        var formData = [];

        $.each(window.location.hash.replace("#", "").split("&"), function (i, urlParam) {
            urlParam = urlParam.split("=");
            formData[urlParam[0]] = urlParam[1];
        });

        if(formData.channel) {
            updateTimeList();
            updateShowList(formData.channel);
            updateContentList(formData.channel);
        }
    }

    /**
     * Sync the list of channels with the database.
     */
    function updateChannelList() {
        $.couch.db("persad").openDoc("channelList", {
            success: function(data) {
                $("#channelListTemplate").Chevron("render", {
                    'channels': data.channels
                }, function(result){
                    $('#channel-list').html(result);

                    // re-calculate the width based on the added channels
                    var sum = 0;
                    $('#channel-list ul li').each( function(){
                        sum += $(this).width() + 3;
                    });

                    $('#channel-list ul').width(sum);
                });

            },
            error: function(status) {
                alert(status);
            }
        });
    }

    /**
     * Update the time list.
     */
    function updateTimeList() {
        var times = [];
        
        for(var i=5; i<=28; i++) {
            var hour = i;
            if(i > 23) {
                hour -= 24;
            }
            for(var minute=0; minute<=30; minute+=30){
                times.push(helper.pad(hour, 2) + ':' + helper.pad(minute,2));
            }
        }
                                
        $("#timeListTemplate").Chevron("render", { 
            times: times 
        }, function(result){
            $('#guide #time-list').html(result);
        });

    }

    /**
     * Load the shows for a specific channel.
     */
    function updateShowList(channel) {
        $.couch.db("persad").view("show/by-channel", {
            'key': channel,

            success: function(data) {
                var dataList = prepareListData(data);

                $("#showListTemplate").Chevron("render", {
                    'shows': dataList
                }, function(result){
                    $('#guide #show-list').html(result);
                });
            },
            error: function(status) {
                console.log(status);
            }
        });
    }

    /**
     * Load the additional content for a specific channel.
     */
    function updateContentList(channel) {
        $.couch.db("persad").view("content/by-channel", {
            'key': channel,

            success: function(data) {
                var dataList = prepareListData(data);
                console.log(dataList);
                $("#contentListTemplate").Chevron("render", {
                    'contents': dataList
                }, function(result){
                    $('#content-list').html(result);
                });
            },
            error: function(status) {
                console.log(status);
            }
        });
    }

    function showForm(type, data) {
        $("#contentHeaderTemplate").Chevron("render", {}, function(resultHeader){
            $("#contentFooterTemplate").Chevron("render", {}, function(resultFooter){
                $("#" + type).Chevron("render", data, function(result){
                    $('#content-form').html(resultHeader + result + resultFooter);
                    initValidation();
                });
            });
        });



    }

    /**
     * Valiate a submitted form and persist it to the database.
     */
    function initValidation() {
        $("input,select,textarea").not("[type=submit]").jqBootstrapValidation({
            preventSubmit: true,
            submitError: errorContentForm,
            submitSuccess: storeContentForm
        });
    }

    function errorContentForm(form, event, errors) {
        console.log('error');

        event.preventDefault();
    }

    function storeContentForm(form, event) {
        var data = $('.contentForm input, .contentForm select, .contentForm textarea').serializeArray();
        var doc = prepareCouchData(data);

        if(doc.type == 'content' && doc.category == 'freetext') {
            doc.startDate = helper.dateToArr(new Date(helper.formatDate(doc.startDate)));
            doc.endDate = helper.dateToArr(new Date(helper.formatDate(doc.endDate)));
        }
        console.log(doc);
        $.couch.db("persad").saveDoc(doc, {
            success: function(data) {
                var data = {
                    'method': 'channel-content-updated',
                    'channel': doc.channel
                };

                websocket.send(JSON.stringify(data));
                updateContentList(doc.channel);
            },
            error: function(status) {
                alert(status);
            }
        });

        event.preventDefault();
    }

    /**
     * Prepare couch db list data for mustache.
     */
    function prepareListData(data) {
        var dataList = [];
        var prevEndTime = '05:00';
        
        $.each(data.rows, function(index, value) {
            var elem = value.value;
            var duration = helper.calcDuration(elem.startDate, elem.endDate, 'sec');
            
            var startTime = helper.parseHourMin(elem.startDate);
            var endTime = helper.parseHourMin(elem.endDate);
            
            var width = (duration / 10) - 7;
            var margin = helper.calcTimeDiff(prevEndTime, startTime) * 6;
                        
            elem.formatted = {
                'start': startTime,
                'duration': (duration/60) + 'min',
                'width': width,
                'margin': margin
            }
            dataList.push(value.value);
            prevEndTime = endTime;
        });

        return dataList;
    }

    /**
     * Prepare form data to match the couchdb json format.
     */
    function prepareCouchData(data) {
        var doc = {};

        $.each(data, function(index, value) {
            doc[value.name] = value.value;
        });

        return doc;
    }

    $(document).on('click', '#channel-list li a', function(){
        $('#channel-list li a').removeClass('active');
        $(this).addClass('active');
        $('#channel').val($(this).attr('data-channel-id'));
    });

    $(document).on('click', '#content-list li a button', function(){
        var channel = $('#channel-list li a.active').attr('data-channel-id');

        var docId = $(this).parent().attr('data-id');
        var docRev = $(this).parent().attr('data-rev');

        var doc = {
            _id: docId,
            _rev: docRev
        };

        $.couch.db("persad").removeDoc(doc, {
            success: function(data) {
                var wsData = {
                    'method': 'channel-content-updated',
                    'channel': channel
                };

                websocket.send(JSON.stringify(wsData));

                updateContentList(channel);
            },
            error: function(status) {
                console.log(status);
            }
        });

        return false;

    });
});