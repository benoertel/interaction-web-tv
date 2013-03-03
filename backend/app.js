/* 
 * This is the starting point of the second screen device app.
 */

$(document).ready(function() {
    var config = {
        scripts: [
        '/shared/js/lib/bootstrap-datetimepicker.js',
        '/backend/js/websocket.js',
        '/backend/js/contentList.js',
        '/backend/js/contentForm.js',
        '/backend/js/channelList.js',
        '/backend/js/timeList.js',
        '/backend/js/showList.js',
        '/backend/js/dateList.js',
        '/shared/js/lib/bootstrap.min.js',
        '/shared/js/lib/mustache.js',
        '/shared/js/lib/chevron.js',
        '/shared/js/lib/jqBootstrapValidation.js',
        '/shared/js/lib/jquery.couch.js',
        '/shared/js/helper.js',
        '/shared/js/config.js',
        '/shared/js/lib/bootstrap-datetimepicker.de.js'
        ],
        stylesheets: [
        '/shared/css/bootstrap.css',
        '/shared/css/bootstrap-responsive.css',
        '/backend/css/bootstrap-datetimepicker.min.css',
        '/backend/css/style.css',
        '/shared/css/style.css'
        ],
        templates: [
        {
            'id': 'channelListTemplate',
            'location': '/backend/templates/channelList.mustache'
        },
        {
            'id': 'showListTemplate',
            'location': '/backend/templates/showList.mustache'
        },
        {
            'id': 'contentListTemplate',
            'location': '/backend/templates/contentList.mustache'
        },
        {
            'id': 'timeListTemplate',
            'location': '/backend/templates/timeList.mustache'
        },
        {
            'id': 'dateListTemplate',
            'location': '/backend/templates/dateList.mustache'
        },
        {
            'id': 'contentHeaderTemplate',
            'location': '/backend/templates/content/_header.mustache'
        },
        {
            'id': 'contentFooterTemplate',
            'location': '/backend/templates/content/_footer.mustache'
        },
        {
            'id': 'contentFreetextTemplate',
            'location': '/backend/templates/content/freetext.mustache'
        },
        {
            'id': 'contentPollTemplate',
            'location': '/backend/templates/content/poll.mustache'
        }
        ]
    };
    
    var contentTypes = [
    {
        id: 'freetext',
        label: 'Freitext',
        labelField: 'title'
    },{
        id: 'poll',
        label: 'Umfrage',
        labelField: 'question'
    }
    ];

   
    var app = new App(config, loaded);
        
    function loaded() {    
        var modalOptions = {
            keyboard: false,
            show: true,
            backdrop: 'static'
        }
    
        $.couch.urlPrefix = couchdbUri;
        
        var helper = new Helper();
        
        var contentList = new ContentList(helper, contentTypes);
        var contentForm = new ContentForm(helper, contentTypes);
        var channelList = new ChannelList(helper);
        var timeList = new TimeList(helper);
        var showList = new ShowList(helper);
        var dateList = new DateList(helper);
        
        var websocket = new WebsocketClient(websocketUri, contentList);
        
        channelList.load();
        timeList.render();
        dateList.render();
        contentForm.render(websocket);
        
        $(window).bind('hashchange', function() {
            var params = helper.getHashParams();
            if(params.date) {
                dateList.selectedDate = params.date;
            } else if(params.day) {
                dateList.selectedDay = params.day;
            }
            
            if(params.channel) {
                channelList.selected = params.channel;
                contentForm.channel = channelList.selected;
                showList.load(dateList.date, params.channel);
                contentList.load(dateList.date, params.channel);
            }
        });
        $(window).trigger('hashchange');
        
        $(document).on('click', '#channel-list li a', function(){
            channelList.selected = $(this).attr('data-channel-id');
            contentForm.channel = channelList.selected;
            
            var date = $('#programme-date select').val(); 
            var day = $('a[data-day-id].active').attr('data-day-id');
            var channel = $('#channel-list a.active').attr('data-channel-id');
            
            if(date != 'Datum') {
                window.location.hash = '#!/channel=' + channel + '&date=' + date;  
            } else {
                window.location.hash = '#!/channel=' + channel + '&day=' + day;                
            }
            
            return false;
        });
        
        $(document).on('click', 'a[data-day-id]', function(){
            var day = $(this).attr('data-day-id');
            var channel = $('#channel-list a.active').attr('data-channel-id');
            
            window.location.hash = '#!/channel=' + channel + '&day=' + day;
            
            return false;
        });
        
        $(document).on('change', '#programme-date select', function() {
            var date = $(this).val(); 
            var channel = $('#channel-list a.active').attr('data-channel-id');
          
            window.location.hash = '#!/channel=' + channel + '&date=' + date;
        });
        
        $(document).on('change', '#contentType', function() {
            contentForm.contentType = $(this).val();
        });
    }
});