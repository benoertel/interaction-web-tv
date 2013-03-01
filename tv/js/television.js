function Television(id, helper) {
    this.id = id;
    if(!this.id) {
        $.totalStorage('tvId', helper.randId());
        this.id = $.totalStorage('tvId');
    }
    this.video = document.getElementById('tv-stream');
    this.channel = null;
    this.status = 'paused';
    this.mode = 'television';
    this.volume = 0;
    
    this.channelList = [
    'schweig-hd',
    'rtl2'
    ];
    this.channelId = 0
    this.channel = this.channelList[0];
    this.file = null;
}

Television.prototype.getConfigResponse = function(json, websocket) {
    this.mode = json.mode;
    
    if(json.mode == 'movie') {
        this.channel = json.channel;
        this.file = json.file;
    }
    
    this.updateSource();
}

/**
 * up/down arrow on keyboard was pressed, need to zapp channel.
 */
Television.prototype.zapp = function(direction, socket) {
    // zapping disabled for movie mode
    if(this.mode == 'movie') {
        console.log('zapping disabled for movie mode');
        return;
    }
    
    var channelId = this.channelId;
    if(direction == 'up') {
        channelId++;
        if(channelId > this.channelList.length - 1) {
            channelId = 0;
        }
    } else {
        channelId--;
        if(channelId < 0) {
            channelId = this.channelList.length - 1;
        }
    }
    
    this.channelId = channelId;
    this.channel = this.channelList[channelId];
    this.updateSource();
    this.video.play();
    
    var data = {
        'method': 'channel-changed',
        'tvId': this.id,
        'channel': this.channel
    };
    socket.send(data);
}

Television.prototype.updateSource = function() {
    if(this.video) {
        this.video.pause();
        this.video.src = "";
        this.video.load();
    }
    $('video').remove();
    this.video = document.createElement('video');
    this.video.volume = this.volume;
        
    $('body').append(this.video);
    $('video').attr('id', 'tv-stream');
    $('video').attr('height', $(window).height());

    var source = document.createElement('source');
    source.type = 'video/mp4';
    
    if(this.mode == 'movie') {
        source.src = this.file;
    } else {
        source.src = 'http://localhost:2013/data/' + this.channel + '.mp4';        
    }
    
    this.video.appendChild(source);
    
    if(this.mode == 'television') {
        this.video.play();
    }
}

/**
 * Switch status of television between play and pause.
 */
Television.prototype.togglePlay = function(socket) {
    if(this.mode == 'television') {
        console.log('pausing is disabled for television mode');
        return;
    }
    
    var data = {
        'tvId': this.id,
        'channel': this.channel
    };
        
    if(this.video.paused) {
        data.method = 'movie-play';
        data.start = Math.round(this.video.currentTime);
        
        this.video.play();           
    } else {
        data.method = 'movie-pause';
        
        this.video.pause();
    }
        
    socket.send(data);
}