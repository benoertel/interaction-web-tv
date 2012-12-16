$(document).ready(function() {
    $.couch.urlPrefix = couchdbUri;
  
    var remoteId = '8KJLAoBXIoRqY34j';
    var websocket = null;
    var receiveUpdates = true;

    setupWebsocket();
    showLoginForm();
    
    $('a[rel=tooltip]').tooltip();
    
    function showLoginForm() {
        $("#loginFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#loginModal').modal('show');
            });  
    }
    
    function showSignupForm() {
        $("#signupFormTemplate").Chevron("render", {
            }, function(result){
                $('#modal').html(result);
                $('#signupModal').modal('show');
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
        }
    });
   
    function showSettings(){
        $("#settingsTemplate").Chevron("render", {
            deviceId: remoteId
            }, function(result){
                $('#modal').html(result);
                $('#settingsModal').modal('show');
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
        var data = {
            'method': 'subscribe',
            'remoteId': remoteId
        };
        
        websocket.send(JSON.stringify(data));
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
    
    function onWebsocketMessage(message) {
        var json = JSON.parse(message.data);

        if(json.method == 'zapp') {
            var dataList = prepareListData(json.data);

            $("#contentListTemplate").Chevron("render", {
                'contents': dataList
            }, function(result){
                $('#content-list').html(result);
                    
            });
                
            $('#current-channel').html(json.channel);
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
    
    function toggleReceiveUpdates() {        
        if(!receiveUpdates) {
            $('#live-updates i').removeClass('icon-play');
            $('#live-updates i').addClass('icon-pause');
            $('#live-updates').attr('data-original-title', 'receiving live updates');
            receiveUpdates = true;
            
        } else {
            $('#live-updates i').removeClass('icon-pause');
            $('#live-updates i').addClass('icon-play');
            $('#live-updates').attr('data-original-title', 'no live updates');
            receiveUpdates = false;
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
});