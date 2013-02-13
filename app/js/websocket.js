function WebsocketClient(websocketUri){
    this.websocket = new Websocket(websocketUri);
    
    this.websocket.onopen = onWebsocketOpen;
    this.websocket.onerror = onWebsocketError;
    this.websocket.onclose = onWebsocketClose;
    this.websocket.onmessage = onWebsocketMessage;
    
    this.status = 'disconnected';
    this.tv = null;
    this.user = null;
    this.contentList = null;
}

ContentList.prototype = {
    get tv(){
        return this._tv;
    },
    
    set tv(tv) {
        this._tv = tv;
    },
    
    get user(){
        return this._user;
    },
    
    set user(user) {
        this._user = user;
    },
    
    get contentList(){
        return this._contentList;
    },
    
    set contentList(contentList) {
        this._contentList = contentList;
    }
}

WebsocketClient.prototype.onopen = function(event) {
    this.status('connected');
    if(credentials) {
        this.websocket.send(JSON.stringify(credentials));
    }
};
    
WebsocketClient.prototype.onclose = function(event) {
    updateWebsocketStatus('disconnected');
    this.tv.status('unavailable');
        
    window.setTimeout(function() {
        setupWebsocket()
    }, 5000);
}
    
WebsocketClient.prototype.onerror = function(event) {
    alert('error');
}
    
function onWebsocketMessage(message) {
    var json = JSON.parse(message.data);

    if(json.method == 'channel-changed') {
        this.tv.channel(json);
    } else if(json.method == 'content-changed') {
        this.contentList.changed(json.data);
    } else if(json.method == 'login-user-response') {
        this.user.loginResponse(json);
    } else if(json.method == 'register-user-response') {
        this.user.registerResponse(json);
    } else if(json.method == 'subscribe-response') {
        this.contentList.subscribeResponse(json);
    } else if(json.method == 'tv-disconnected') {
        this.tv.disconnect();
    }else if(json.method == 'display-link') {
        displayLink(json);
    }
}
    
WebsocketClient.prototype.status = function(status) {
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