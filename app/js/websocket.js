function WebsocketClient(websocketUri, tv, user, contentList){
    this.websocketUri = websocketUri;
    this.socket = new WebSocket(this.websocketUri);
    this.init();
    
    this.status = 'disconnected';
    this.tv = tv;
    this.user = user;
    this.contentList = contentList;
}

WebsocketClient.prototype = {
    set status(status) {
        this.statusChanged(status);
    }    
   /* get tv(){
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
    }*/
}

WebsocketClient.prototype.init = function() {
    var context = this;

    this.socket.onopen = function(event) {
        context.onopen(event);
    }
    this.socket.onerror = function(event) {
        context.onerror(event);
    }
    this.socket.onclose = function(event) {
        context.onclose(event);
    }
    this.socket.onmessage = function(event) {
        context.onmessage(event);
    }
}

WebsocketClient.prototype.onopen = function(event) {
    console.log('ws onopen');
    
    this.status = 'connected';
//    if(credentials) {
//        this.socket.send(JSON.stringify(credentials));
//    }
};
    
WebsocketClient.prototype.onclose = function(event) {
    console.log('ws onclose');
    
    this.status = 'disconnected';
    this.tv.status = 'unavailable';
    
    var context = this;
    window.setTimeout(function() {
        context.socket = new WebSocket(context.websocketUri);
        context.init();
    }, 5000);
}
    
WebsocketClient.prototype.onerror = function(event) {
    alert('error');
}
    
WebsocketClient.prototype.onmessage = function(message, kk) {
    var json = JSON.parse(message.data);

    if(json.method == 'channel-changed') {
        this.tv.channel = json;
    } else if(json.method == 'content-changed') {
        this.contentList.push(json.data);
        if(this.tv.receiveUpdates) {
            this.contentList.render();
        }
    } else if(json.method == 'login-user-response') {
        this.user.loginResponse(json, this.tv, this);
    } else if(json.method == 'register-user-response') {
        this.user.registerResponse(json);
    } else if(json.method == 'subscribe-response') {
        this.tv.subscribeResponse(json);
    } else if(json.method == 'tv-disconnected') {
        this.tv.disconnect();
    } else if(json.method == 'display-link') {
        displayLink(json);
    }
}
    
WebsocketClient.prototype.statusChanged = function(status) {
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

WebsocketClient.prototype.send = function(data) {
    this.socket.send(JSON.stringify(data));
}