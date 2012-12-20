$(document).ready(function() {
  
    var tvId = null;
    var websocket = null;
    var receiveUpdates = true;
    var latestData = null;
    var credentials = null;
    
    var modalOptions = {
        keyboard: false,
        show: true,
        backdrop: 'static'
    }
    
    init();
    setupWebsocket();
    showLoginForm();
    
    $('a[rel=tooltip]').tooltip();
    
    function init() {
        $("link[rel=template]").Chevron("preload", function(){
            tvId = $.cookie('tvId');
        });
    }
    
    function showLoginForm(callback) {
        $('#loginModal').modal('hide');
        $('#signupModal').modal('hide');
        
        $("#loginFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#loginModal').modal(modalOptions);
                
                if(callback) {
                    callback();
                }
            });  
    }
    
    function showSignupForm() {
        $('#loginModal').modal('hide');
        $('#signupModal').modal('hide');
        
        $("#signupFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#signupModal').modal(modalOptions);
            });  
    }
    
    $('button[data-action], a[data-action]').live('click', function(){
        var action = $(this).attr('data-action');

        if(action == 'signup') {
            showSignupForm();
        } else if(action == 'login') {
            showLoginForm();
        } else if(action == 'settings') {
            showSettings();
        } else if(action == 'toggle-updates') {
            toggleReceiveUpdates();
        } else if(action == 'update-settings') {
            updateSettings();
        } else if(action == 'register-user') {
            registerUser();
        } else if(action == 'login-user') {
            loginUser();
        }
    });
   
    function showSettings(){
        $("#settingsTemplate").Chevron("render", {
            tvId: tvId
        }, function(result){
            $('#modal').html(result);
            $('#settingsModal').modal(modalOptions);
        });
    }
    
    function setupWebsocket() {
        websocket = new WebSocket(websocketUri);

        websocket.onopen = onWebsocketOpen;
        websocket.onerror = onWebsocketError;
        websocket.onclose = onWebsocketClose;
        websocket.onmessage = onWebsocketMessage;
    }
    
    function onWebsocketOpen(event) {
        updateWebsocketStatus('connected');
        if(credentials) {
            websocket.send(JSON.stringify(credentials));
        }
    }
    
    function onWebsocketClose(event) {
        updateWebsocketStatus('disconnected');
        updateTvStatus('unavailable');
        window.setTimeout(function() {
            setupWebsocket()
        }, 5000);
    }
    
    function onWebsocketError(event) {
        alert('error');
    }
    
    function onWebsocketMessage(message) {
        var json = JSON.parse(message.data);

        if(json.method == 'channel-changed') {
            channelChanged(json);
        } else if(json.method == 'login-user-response') {
            loginUserResponse(json);
        } else if(json.method == 'register-user-response') {
            registerUserResponse(json);
        } else if(json.method == 'subscribe-response') {
            subscribeResponse(json);
        } else if(json.method == 'tv-disconnected') {
            tvDisconnected(json);
        }
    }
    
    function updateWebsocketStatus(status) {
        if(status == 'connected') {
            $('#websocket-status').attr('data-status', 'connected');
            $('#websocket-status').attr('data-original-title', 'connection established');
            
        } else if(status == 'disconnected') {
            $('#websocket-status').attr('data-status', 'disconnected');
            $('#websocket-status').attr('data-original-title', 'no connection');
        }
    }
    
    function updateTvStatus(status) {
        if(status == 'available') {
            $('#tv-status').attr('data-status', 'available');
            $('#tv-status').attr('data-original-title', 'tv is available');
            
        } else if(status == 'unavailable') {
            $('#tv-status').attr('data-status', 'unavailable');
            $('#tv-status').attr('data-original-title', 'tv is not available');
        }
    }
    
    function toggleReceiveUpdates() {        
        if(!receiveUpdates) {
            $('#live-updates i').removeClass('icon-play');
            $('#live-updates i').addClass('icon-pause');
            $('#live-updates').attr('data-original-title', 'receiving live updates');
            receiveUpdates = true;
            
            channelChanged(latestData);
        } else {
            $('#live-updates i').removeClass('icon-pause');
            $('#live-updates i').addClass('icon-play');
            $('#live-updates').attr('data-original-title', 'no live updates');
            receiveUpdates = false;
        }
    }
    
    function channelChanged(data) {
        latestData = data;
        updateTvStatus('available');
        if(receiveUpdates){
            var dataList = prepareListData(data.data);

            $("#contentListTemplate").Chevron("render", {
                'contents': dataList
            }, function(result){
                $('#content-list').html(result);       
            });
                
            $('#current-channel').html(data.channel);
        }
    }
    
    function tvDisconnected() {
        updateTvStatus('unavailable');
    }
    
    function subscribe() {
        var data = {
            'method': 'subscribe',
            'tvId': tvId
        };
        
        websocket.send(JSON.stringify(data));
    }
    
    function subscribeResponse(data) {
        if(data.status == 'success'){
            channelChanged(data.tv);
            updateTvStatus('available');
        }
    }
    
    function updateSettings() {
        tvId = $('#tvId').val();

        $.cookie('tvId', tvId, {
            expires: 365
        });
        
        subscribe();
    }
    
    /**
     * User registration and login 
     */
    function registerUser() {
        $('#signupForm .alert').remove();
        $('#signupForm .loader').remove();
        
        var data = {
            'method': 'register-user',
            'username': $('#username').val(),
            'password': $('#password').val(),
            'age': $('#age').val(),
            'sex': $('#sex').val()
        };
        
        websocket.send(JSON.stringify(data));
    }
    
    function registerUserResponse(data) {
        $('#loginForm .loader').remove();
        
        var alert = createAlert(data.status, data.message);
        
        if(data.status == 'success') {
            $('#signupModal').modal('hide');
            showLoginForm(function() {
                $('#loginForm').prepend(alert);
            })   
            
        } else {
            $('#signupForm').prepend(alert);

        }
    }
    
    function loginUser() {
        $('#loginForm .alert').remove();
        $('#loginForm .loader').remove();
        
        $('#loginForm').prepend('<div class="loader"></div>');
        
        credentials = {
            'method': 'login-user',
            'username': $('#username').val(),
            'password': $('#password').val()
        };
        
        websocket.send(JSON.stringify(credentials));
    }
    
    function loginUserResponse(data) {
        console.log(data);
        $('#loginForm .loader').remove();
        
        var alert = createAlert(data.status, data.message);
        
        $('#loginForm').prepend(alert);
        $('span.username').html(data.user.username);
        
        if(data.status == 'success') {
            subscribe();
            $('#loginForm').prepend('<div class="loader"></div>');
            window.setTimeout(function() {
                $('#loginModal').modal('hide');
            }, 2000);
        }
    }
    
    /**
     * Prepare couch db list data for mustache.
     */
    function prepareListData(data) {
        var dataList = [];
        
        if(data){
            $.each(data, function(index, value) { 
                dataList.push(value.value);
            });
        }
         
        return dataList;
    }
    
    function createAlert(type, text) {
        var classes = 'alert ';
        
        if(type == 'error') {
            classes += ' alert-error';
        } else if(type == 'success') {
            classes += 'alert-success';
        }
        
        return '<div class="' + classes + '">' + text + '</div>';
    }
});