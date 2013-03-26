function WebsocketClient(websocketUri, contentList){
    this.websocketUri = websocketUri;
    this.socket = new WebSocket(this.websocketUri);
    this.init();
    
    this.status = 'disconnected';
    this.contentList = contentList;
}

WebsocketClient.prototype = {
    set status(status) {
        this.statusChanged(status);
    }    
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

/**
 * Websocket connection opened.
 */
WebsocketClient.prototype.onopen = function(event) {
    console.log('ws onopen');
    
    this.status = 'connected';
};

/**
 * Websocket connection closed.
 */
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

/**
 * Websocket connection error.
 */
WebsocketClient.prototype.onerror = function(event) {
    alert('error');
}

/**
 * Websocket connection message received.
 */
WebsocketClient.prototype.onmessage = function(message) {
    var json = JSON.parse(message.data);

    if(json.method == 'channel-changed') {
        this.tv.channel = json.channel;
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
    }
}

/**
 * Websocket connection established/broke.
 */
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