function Television(id) {
    this.id = id;
    this.channel = null;
    this.status = 'unavailable';
    this.receiveUpdates = true;
}

Television.prototype = {
    get id(){
        return this._id;
    },
    
    set id(id) {
        this._id = id;

        $.totalStorage('remoteId', id);
    },
    
    set channel(channel) {
        this._channel = channel;
        this.channelChanged(channel);
    },
    
    set status(status) {
        this.statusChanged(status);
    }
}

/**
 * Subscribe to the channel of a specific television.
 */
Television.prototype.subscribe = function(websocket) {
    var data = {
        'method': 'subscribe',
        'tvId': this.id
    };
        
    websocket.send(data);       
};

/**
 * Received response for subscription from the server.
 */
Television.prototype.subscribeResponse = function(data) {
    if(data.status == 'success'){
        this.channel = data.tv.channel;
        this.status = 'available';
    }
};

/**
 * The channel on the television changed.
 */
Television.prototype.channelChanged = function(channel) {
    this.status = 'available';

    if(this.receiveUpdates){
        $('#current-channel').html(channel);
    }
};

/**
 * Disconnect the television.
 */
Television.prototype.disconnect = function() {
    this.status = 'unavailable';
}

/**
 * The status on the televison changed.
 */
Television.prototype.statusChanged = function(status) {
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

/**
 * Toggle whether to receive updates or not.
 */
Television.prototype.toggleReceiveUpdates = function(contentList) {
    if(!this.receiveUpdates) {
        $('#live-updates i').removeClass('gicon-play');
        $('#live-updates i').addClass('gicon-pause');
        $('#live-updates').attr('data-original-title', 'receiving live updates');
        this.receiveUpdates = true;
        
        if(contentList) {
            this.channel = contentList.top().channel;
            contentList.render();
        }
    } else {
        $('#live-updates i').removeClass('gicon-pause');
        $('#live-updates i').addClass('gicon-play');
        $('#live-updates').attr('data-original-title', 'no live updates');
        this.receiveUpdates = false;
    }
}

/**
 * Show overlay with settings form.
 */
Television.prototype.showSettings = function(modalOptions){
    $('#settingsTemplate').Chevron('render', {
        tvId: this.id
    }, function(result){
        $('#modal').html(result);
        $('#settingsModal').modal(modalOptions);
    });
}