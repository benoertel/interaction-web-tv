/* 
 * This is the starting point of the television app.
 */

$(document).ready(function() {
    var config = {
        scripts: [
        '/shared/js/lib/jquery.total-storage.min.js',
        '/shared/js/helper.js',
        '/shared/js/config.js',
        '/tv/js/television.js',
        '/tv/js/websocket.js'
        ],
        stylesheets: [
        '/shared/css/bootstrap.css',
        '/shared/css/style.css',
        '/tv/css/style.css'
        ],
        templates: []
    };
   
    var app = new App(config, loaded);
        
    function loaded() {
        var helper = new Helper();
        
        var tv = new Television($.totalStorage('tvId'), helper);
        var websocket = new WebsocketClient(websocketUri, tv);
        
        $(document).on('click', '#tv-stream', function(event) {
            tv.togglePlay(websocket)
        });
        
        $(document).keydown(function(event) {  
            switch(event.keyCode) {
                case 33: // ch +
                case 38: // key up
                    tv.zapp('up', websocket);
                    break;
                case 34: // ch -
                case 40: // key down
                    tv.zapp('down', websocket);
                    break;
                case 179: // play, pause
                    tv.togglePlay(websocket);
                    break;
            }
        });
        
        $(window).resize(updateMovieDimension);
    
        function updateMovieDimension() {
            $('video').attr('width', $(window).width());
        
            var top = ($(window).height() - $('video').height()) / 2;
            $('video').css('margin-top', top);
        }
    }
});