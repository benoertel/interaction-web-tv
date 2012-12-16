// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');
var cradle = require('cradle');

var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');
  
// list of currently connected televisions
var devices = [ ];

// list of currently subscribed users
var subscriptions = [ ];

var clients = [ ];

var server = http.createServer();
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin); 
    
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    
    // var deviceId = false;
    /*
    // send back chat history
    connection.send();JSON.stringify( {
        type: 'history'
    } ));
    */

    // user sent some message
    connection.on('message', function(message) {
        
        console.log(clients.length);
        
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);

            if(data.method == 'subscribe') {
                subscriptions[index] = data.remoteId;
                
                db.view('content/by-channel', {
                    key: devices[data.remoteId]
                }, function (err, result) {
                    var obj = { 
                        method: 'zapp',
                        channel: devices[data.remoteId] ,
                        data: result
                    };
                        
                    connection.send(JSON.stringify(obj));
                });
                
            } else if(data.method == 'zapp') {
                devices[data.deviceId] = data.channel;

                db.view('content/by-channel', {
                    key: data.channel
                }, function (err, result) {
                    var obj = { 
                        method: 'zapp',
                        channel: data.channel,
                        data: result
                    };
                    console.log('subscriptions ' + subscriptions.length);
                    console.log(subscriptions);
                    for (var i=0; i < subscriptions.length; i++) {
                        if(subscriptions[i] == data.deviceId) {
                            clients[i].send(JSON.stringify(obj));
                        }
                    }     
                });
                
            } else if(data.method == 'channel-content-updated') {
                
                db.view('content/by-channel', {
                    key: data.channel
                }, function (err, result) {
                    var obj = { 
                        method: 'zapp',
                        channel: data.channel,
                        data: result
                    };
                        
                    for(var deviceId in devices) {
                        if(devices[deviceId] == data.channel) {
                            for (var i=0; i < subscriptions.length; i++) {
                                if(subscriptions[i] == deviceId) {
                                    clients[i].send(JSON.stringify(obj));
                                }
                            }
                        } 
                    }
                });
                
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        // remove user from the list of connected clients
        clients.splice(index, 1);
        subscriptions.splice(index, 1);
        
        console.log('connection closed');
    });
});