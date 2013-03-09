/* 
 * This is the starting point of the second screen device app.
 */

$(document).ready(function() {
    var config = {
        scripts: [
        '/app/js/user.js',
        '/app/js/contentList.js',
        '/app/js/bookmarkList.js',
        '/app/js/television.js',
        '/app/js/websocket.js',
        '/shared/js/lib/bootstrap.min.js',
        '/shared/js/lib/mustache.js',
        '/shared/js/lib/chevron.js',
        '/shared/js/lib/jqBootstrapValidation.js',
        '/shared/js/lib/jquery.total-storage.min.js',
        '/shared/js/helper.js',
        '/shared/js/config.js'
        ],
        stylesheets: [
        '/shared/css/bootstrap.css',
        '/shared/css/bootstrap-responsive.css',
        '/app/css/style.css',
        '/shared/css/style.css'
        ],
        templates: [
        {
            'id': 'contentFreetextTemplate',
            'location': '/app/templates/content/freetext.mustache'
        },
        {
            'id': 'signupFormTemplate',
            'location': '/app/templates/signupForm.mustache'
        },
        {
            'id': 'loginFormTemplate',
            'location': '/app/templates/loginForm.mustache'
        },
        {
            'id': 'settingsTemplate',
            'location': '/app/templates/settings.mustache'
        },
        {
            'id': 'bookmarksTemplate',
            'location': '/app/templates/bookmarks.mustache'
        },
        {
            'id': 'displayLinkTemplate',
            'location': '/app/templates/displayLink.mustache'
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
    
        var helper = new Helper();
        
        var tv = new Television($.totalStorage('remoteId'));
        var user = new User(helper);
        var contentList = new ContentList(helper);
        var bookmarkList = new BookmarkList();
        
        var websocket = new WebsocketClient(websocketUri, tv, user, contentList);
        
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
        });
    }
});