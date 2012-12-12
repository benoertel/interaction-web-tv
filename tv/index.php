<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                padding: 0;
                margin: 0;
                text-align: center;
                background: black;
            }
        </style>

        <script src="/shared/resources/js/jquery-1.8.3.min.js"></script>
        <script src="/shared/resources/js/jquery.cookie.js"></script>
        <script>
            $(document).ready(function(){
                
                var channels = [
                    'ard',
                    'zdf',
                    'rtl',
                    'rtl2'
                ];
                
                var deviceId = $.cookie('persad');
                if(!deviceId) {
                    deviceId = makeid();
                    $.cookie('persad', deviceId, { expires: 365 });
                }
                notifyChannelChange(0);
                                
                /**
                 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
                 */
                function makeid() {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for( var i=0; i < 16; i++ )
                        text += possible.charAt(Math.floor(Math.random() * possible.length));

                    return text;
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
                
                function togglePlay() {
                    //$('#tv-stream').play();
                    //$('#tv-stream').pause();
                }
 
                function zapp(direction){                
                    var channel = $('#tv-stream').attr('data-channel');
                  
                    if(direction == 'up') {
                        channel++;
                        if(channel > channels.length - 1) {
                            channel = 0;
                        }
                    } else {
                        channel--;
                        if(channel < 0) {
                            channel = channels.length - 1;
                        }
                    }
                  
                    $('video').remove();
                    var video = document.createElement('video');
                    $('body').append(video);
                    $('video').attr('data-channel', channel);
                    $('video').attr('id', 'tv-stream');
                    $('video').attr('height', $(window).height());

                    addSourceToVideo(video, 'http://192.168.1.9:2013/tv/data/' + channels[channel] + '.m4v', 'video/mp4');

                    video.play();
                    
                    // notify server about current channel                    
                    notifyChannelChange(channel);
                }
                
                function notifyChannelChange(channel){
                    console.log(deviceId + '___' + channels[channel]);
                }
            });
        </script>
    </head>
    <body>
        <?php
        // login, device will be added to user account
        // when logged in, let user switch between channels
        ?>
        <video autoplay controls id="tv-stream" data-channel="0">
            <source src="http://192.168.1.9:2013/tv/data/ard.m4v" type="video/mp4" />
        </video>
    </body>
</html>