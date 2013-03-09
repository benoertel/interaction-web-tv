function WebsocketClient(websocketUri, tv){
    this.websocketUri = websocketUri;
    this.socket = new WebSocket(this.websocketUri);
    this.init();
    
    this.status = 'disconnected';
    this.tv = tv;
}

WebsocketClient.prototype = {
    set status(status) {
        this._status = status;
        this.statusChanged();
    },
    
    get status() {
        return this._status;
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

WebsocketClient.prototype.onopen = function(event) {
    this.status = 'connected';
    
    var data = {
        'method': 'get-config',
        'tvId': this.tv.id
    };
    this.send(data);
};
    
WebsocketClient.prototype.onclose = function(event) {
    this.status = 'disconnected';
    
    var context = this;
    window.setTimeout(function() {
        context.socket = new WebSocket(context.websocketUri);
        context.init();
    }, 5000);
}
    
WebsocketClient.prototype.onerror = function(event) {
    alert('error');
}
    
WebsocketClient.prototype.onmessage = function(message) {
    var json = JSON.parse(message.data);

    if(json.method == 'get-config-response') {
        this.tv.getConfigResponse(json);
    }
}
    
WebsocketClient.prototype.statusChanged = function() {
    if(this.status == 'connected') {
        $('#websocket-status i').removeClass('gicon-ws-signal-off');
        $('#websocket-status i').addClass('gicon-ws-signal-on');
        $('#websocket-status').attr('data-status', 'connected');
        $('#websocket-status').attr('data-original-title', 'connection established');
            
    } else if(this.status == 'disconnected') {
        $('#websocket-status i').removeClass('gicon-ws-signal-on');
        $('#websocket-status i').addClass('gicon-ws-signal-off');
        $('#websocket-status').attr('data-status', 'disconnected');
        $('#websocket-status').attr('data-original-title', 'no connection');
    }
}

WebsocketClient.prototype.send = function(data) {
    this.socket.send(JSON.stringify(data));
}