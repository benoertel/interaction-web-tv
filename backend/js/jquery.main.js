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