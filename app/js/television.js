function Television(id, channel, contentList) {
    this.id = id;
    this.channel = channel;
    this.status = 'unavailable';
    this.receiveUpdates = true;
    this.contentList = contentList;
}

Television.prototype = {
    get id(){
        return this._id;
    },
    
    set id(id) {
        this._id = id;

        $.cookie('tvId', id, {
            expires: 365
        });
        
        tv.subscribe();
    }
}

Television.prototype.subscribe = function() {
    var data = {
        'method': 'subscribe',
        'tvId': this.id
    };
        
    websocket.send(JSON.stringify(data));       
};

Television.prototype.subscribeResponse = function(data) {
    if(data.status == 'success'){
        this.channel(data.tv);
        this.status('available');
    }
};

Television.prototype.channel = function(data) {
    this.status('available');
    if(receiveUpdates){
        $('#current-channel').html(data.channel);
        this.contentList.changed(latestData);
    }
};

Television.prototype.disconnect = function() {
    this.status('unavailable');
}

Television.prototype.status = function(status) {
    if(status == 'available') {
        $('#tv-status i').removeClass('gicon-tv-signal-off');
        $('#tv-status i').addClass('gicon-tv-signal-on');
        $('#tv-status').attr('data-status', 'available');
        $('#tv-status').attr('data-original-title', 'tv is available');
            
    } else if(status == 'unavailable') {
        $('#tv-status i').removeClass('gicon-tv-signal-on');
        $('#tv-status i').addClass('gicon-tv-signal-off');
        $('#tv-status').attr('data-status', 'unavailable');
        $('#tv-status').attr('data-original-title', 'tv is not available');
    }
};

Television.prototype.toggleReceiveUpdates = function() {
    if(!this.receiveUpdates) {
        $('#live-updates i').removeClass('gicon-play');
        $('#live-updates i').addClass('gicon-pause');
        $('#live-updates').attr('data-original-title', 'receiving live updates');
        this.receiveUpdates = true;
            
        this.channel(this.contentList.top());
    } else {
        $('#live-updates i').removeClass('gicon-pause');
        $('#live-updates i').addClass('gicon-play');
        $('#live-updates').attr('data-original-title', 'no live updates');
        this.receiveUpdates = false;
    }
}