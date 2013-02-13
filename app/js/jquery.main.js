$(document).ready(function() {
    
    var receiveUpdates = true;
    
    var modalOptions = {
        keyboard: false,
        show: true,
        backdrop: 'static'
    }
    
    var helper = new Helper();
    var websocket = new WebsocketClient(websocketUri);
    
    var contentList = new ContentList();
    var user = new User(helper, content, modalOptions, websocket);
    var bookmarks = new BookmarkList();
    var tv = new Television($.cookie('tvId'));
    
    websocket.tv = tv;
    websocket.user = user;
    websocket.contentList = contentList;

    bookmarks.load(false);
    contentList.changed();
    user.showLoginForm();
      
    window.addEventListener("offline", function(e) {
        updateWebsocketStatus('disconnected');
        tv.status('unavailable');
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
            user.showSignupForm();
        } else if(action == 'login') {
            user.showLoginForm();
        } else if(action == 'settings') {
            showSettings();
        } else if(action == 'toggle-updates') {
            toggleReceiveUpdates();
        } else if(action == 'update-settings') {
            tv.id = $('#tvId').val();
        } else if(action == 'register-user') {
            user.register();
        } else if(action == 'login-user') {
            user.login();
        } else if(action == 'bookmark') {
            bookmarks.add(contentList.top());
        } else if(action == 'toggle-delete-bookmarks') {
            bookmarks.toggleRemove();
        } else if(action == 'delete-bookmark') {
            bookmarks.remove($(this).attr('data-id'));
            e.preventDefault();
        }
    });
    
        
    /**
     * User registration and login 
     */     
    function displayLink(json) {
        $("#displayLinkTemplate").Chevron("render", {
            data: json.data
        }, function(result){
            $('#modal').html(result);
            $('#linkModal').modal(modalOptions);
        });
    }
    
    function showSettings(){
        $("#settingsTemplate").Chevron("render", {
            tvId: tv.id
        }, function(result){
            $('#modal').html(result);
            $('#settingsModal').modal(modalOptions);
        });
    }
    
    function updateSettings() {
        tv.id = $('#tvId').val();
    }

});