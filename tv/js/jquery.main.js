$(document).ready(function(){
    
    var tvId = null;
    var websocket = null;
    var channel = null;
    
    var channelList = [
    'schweig-hd'
    ];
    
    var video = document.getElementById('tv-stream');
    var startTimestamp = null;
    
    var hash = document.location.hash;
    hash = hash.substr(1);
    hash = hash.split('/');
    
    // check for faked start time
    if(hash[0] == 'date') {
        startTime = hash[1];
        
        var year = parseInt(hash[1].substr(0, 4));
        var month = parseInt(hash[1].substr(4, 2)) - 1;
        var day = parseInt(hash[1].substr(6, 2));
        var hour = parseInt(hash[1].substr(8, 2));
        var minute = parseInt(hash[1].substr(10, 2));
        var second = parseInt(hash[1].substr(12, 2));
        
        var date = new Date(year, month, day, hour, minute, second);
        
        startTimestamp = date.getTime() / 1000;
    }
    
    init();
    
    function init(){
        initTvId();
        setupWebsocket();
    }
    
    function initTvId() {
        tvId = $.cookie('persad');
        if(!tvId) {
            tvId = makeId();
            $.cookie('persad', tvId, {
                expires: 365
            });
        }
    }
    
    function addSourceToVideo(element, src, type) {
        var source = document.createElement('source');

        source.src = src;
        source.type = type;

        element.appendChild(source);
    }


    $(document).keydown(function(event) {  
        switch(event.keyCode) {
            case 33: // ch +
            case 38: // key up
                zapp('up');
                break;
            case 34: // ch -
            case 40: // key down
                zapp('down');
                break;
            case 179: // play, pause
                togglePlay();
                break;
        }
    });
 
    function zapp(direction){                
        var channelId = $('#tv-stream').attr('data-channel');
                  
        if(direction == 'up') {
            channelId++;
            if(channelId > channelList.length - 1) {
                channelId = 0;
            }
        } else {
            channelId--;
            if(channelId < 0) {
                channelId = channelList.length - 1;
            }
        }
                  
        updateChannel(channelId);
    }
    
    function updateChannel(channelId) {
        channel = channelList[channelId];
        
        video.pause();
        video.src = "";
        video.load();
        
        $('video').remove();
        video = document.createElement('video');
        video.volume= 0;
        
        $('body').append(video);
        $('video').attr('data-channel', channelId);
        $('video').attr('id', 'tv-stream');
        $('video').attr('height', $(window).height());

        addSourceToVideo(video, 'http://localhost:2013/data/' + channel + '.mp4', 'video/mp4');

        if(startTime == null) {
            video.play();
        } else {
            console.log('we start this manually');
        }
                
        $('#program-info').html('tvId: ' + tvId + '<br/> channel: ' + channel);
        
        // notify server about current channel                    
        notifyChannelChange(channel);
    }
                
    function notifyChannelChange(channel){
        var data = {
            'method': 'channel-changed',
            'tvId': tvId,
            'channel': channel
        };
        
        websocket.send(JSON.stringify(data));
    }
    
    function setupWebsocket() {
        websocket = new WebSocket(websocketUri);

        websocket.onopen = onWebsocketOpen;
        websocket.onerror = onWebsocketError;
        websocket.onclose = onWebsocketClose;
    }
    
    function onWebsocketOpen(event) {
        if(!channel) {
            updateChannel(0);
        } else {
            notifyChannelChange(channel);
        }
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
    
    function updateWebsocketStatus(status) {
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
    
    /*
     * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
     */
    function makeId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 16; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    
    $(document).on('click', '#tv-stream', function() {
        var data = {
            'tvId': tvId,
            'channel': channel
        };
            
        if(video.paused) {
            data.method = 'movie-play';
            data.start = Math.round(startTimestamp + video.currentTime);
            
            video.play();           
        } else {
            data.method = 'movie-pause';
            video.pause();
        }
        
        websocket.send(JSON.stringify(data));
        
        console.log(data);
    });
});