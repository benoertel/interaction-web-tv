$(document).ready(function(){
    var helper = new Helper();
    
    $.couch.urlPrefix = couchdbUri;

    $(window).bind('hashchange', hashChanged);

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