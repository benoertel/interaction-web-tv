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
        }
        ]
    };
        
   
    var app = new App(config, loaded);
        
    function loaded() {    
        var modalOptions = {
            keyboard: false,
            show: true,
            backdrop: 'static'
        }
    
        $.couch.urlPrefix = couchdbUri;
        
        var helper = new Helper();
        
        var contentList = new ContentList(helper);
        var contentForm = new ContentForm(helper);
        var channelList = new ChannelList(helper);
        var timeList = new TimeList(helper);
        
        var websocket = new WebsocketClient(websocketUri, contentList);
        
        channelList.load();
        // contentList.load();
        timeList.render();
        contentForm.render(websocket, channelList);
        
        $(document).on('click', '#channel-list li a', function(){
            channelList.selected = $(this).attr('data-channel-id');
            contentForm.channel = channelList.selected;
        });
        
        $(window).bind('hashchange', function() {
            var params = helper.getHashParams();
            if(params.channel) {
                channelList.selected = params.channel;
                contentForm.channel = channelList.selected;
            }
        });
        $(window).trigger('hashchange');
    
    /*
        bookmarkList.load(false);
        contentList.render();
        user.showLoginForm();
      
        window.addEventListener("offline", function(e) {
            websocket.status = 'disconnected';
            tv.status = 'unavailable';
        })
 
        window.addEventListener("online", function(e) {
            setupWebsocket();
        });

        $('a[rel=tooltip]').tooltip();
        $('a[rel=popover]').popover();
    
        $(document).on('keypress', 'form', function(e) {
            if (e.which == 13) {
                $(this).parent().next('.modal-footer').children('.btn-success').click();
            
                return false;
            }
        });
   
        $(document).on('click', 'button[data-action], a[data-action], span[data-action]', function(e){
            var action = $(this).attr('data-action');

            if(action == 'signup') {
                user.showSignupForm(modalOptions);
            } else if(action == 'login') {
                user.showLoginForm(modalOptions);
            } else if(action == 'settings') {
                tv.showSettings(modalOptions);
            } else if(action == 'toggle-updates') {
                tv.toggleReceiveUpdates(contentList);
            } else if(action == 'update-settings') {
                tv.id = $('#tvId').val();
            } else if(action == 'register-user') {
                user.register(websocket);
            } else if(action == 'login-user') {
                user.login(websocket);
            } else if(action == 'bookmark') {
                bookmarkList.push(contentList.top());
            } else if(action == 'toggle-delete-bookmarks') {
                bookmarkList.toggleRemove();
            } else if(action == 'delete-bookmark') {
                bookmarkList.remove($(this).attr('data-id'));
                e.preventDefault();
            }
        });*/
    }
});