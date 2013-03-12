
process.title = 'node-persad';

var cradle = require('cradle');
var hash = require("mhash").hash;
var helper = require('./js/helper.js');
var scheduler = require('./js/scheduler.js');

var WebSocketServer = require('ws').Server;

  
// init global vars
global.televisions = [];
global.subscriptions = [];
global.clients = [];

// read command line args and parse them
var args = helper.parseArgs(process.argv.splice(2));

var mode = args.mode ? args.mode : 'live';
var virtualStart = args.date ? helper.dateStringToDate(args.date) : null;
var channel = args.channel ? args.channel : '-';
var movieFile = args.file ? args.file : null;

console.log('server.js - running in mode: ' + mode);

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');

scheduler.init(db);

// create server
var wss = new WebSocketServer({
    port: 1337
});

// websocket server
wss.on('connection', function(ws) {
    //console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    
    var connection = ws;

    // we need to know client index to remove them on 'close' event
    var device = {
        'index': global.clients.push(ws) - 1,
        'type': null
    };
    ws.on('open', function() {
        connection.send(Date.now().toString(), {
            mask: true
        });
    });

    // user sent some message
    ws.on('message', function(message) {
        var data = JSON.parse(message);

        // send the server configuration to the smart tv
        if(data.method == 'get-config') {
                
            var obj = {
                'method': 'get-config-response',
                'mode': mode
            }
                
            if(mode == 'movie') {
                obj.file = movieFile,
                obj.channel = channel
            }
                
            if(!global.televisions[data.tvId]) {
                device.type = 'tv';
                device.tvId = data.tvId;
                // when it is a new device, we need to notify all second screen
                // devices, that are waiting for this device
                console.log('smart tv ' + data.tvId + ' is online');
                global.televisions[data.tvId] = channel;
            }
                
            connection.send(JSON.stringify(obj));
            
        // a second-screen device subscribes to a smart tv
        } else if(data.method == 'subscribe') {
            device.type = 'second-screen';

            global.subscriptions[device.index] = data.tvId;

            var obj = {
                'method': 'subscribe-response'
            };
            console.log('try connecting to ' + data.tvId);
            console.log(global.televisions);

            // check if tvId exists
            if(global.televisions[data.tvId]) {
                // send back, send in next response the current channel
                obj.status = 'success';
                obj.message = 'Remote Smart-TV is available.';
                obj.tv = {
                    'channel': global.televisions[data.tvId]
                };
            } else {
                obj.status = 'error';
                obj.message = 'Remote Smart-TV currently not available';
            }
                
            connection.send(JSON.stringify(obj));

        // channel change on smart tv
        } else if(data.method == 'channel-changed') {
                
            console.log('channel changed on smart tv');
            global.televisions[data.tvId] = data.channel;

            var obj = {
                method: 'channel-changed',
                channel: data.channel
            };

            for (var i=0; i < global.subscriptions.length; i++) {
                if(global.subscriptions[i] == data.tvId) {
                    if(global.clients[i].authorized) {
                        global.clients[i].send(JSON.stringify(obj));
                    } else {
                        console.log('not authorized anymore');
                    }
                }
            }

        // content of a channel was updated in backend
        } else if(data.method == 'channel-content-updated') {
            db.view('content/by-channel', {
                key: data.channel
            }, function (err, result) {
                scheduler.reset();
                    
            });
                
        } else if(data.method == 'register-user') {
            var obj = {
                'method': 'register-user-response'
            };

            if(!data.username || !data.password) {
                obj.status = 'error';
                obj.message = 'Benutzername und Passwort müssen angegeben werden.';
                clients[device.index].send(JSON.stringify(obj));
            } else {
                var id = 'user-' + data.username;
                db.get(id, function (err, doc) {
                    if(!doc) {
                        db.save(id, {
                            'type': 'user',
                            'age': data.age,
                            'sex': data.sex,
                            'username': data.username,
                            'password': hash("sha512", data.password)
                        }, function (err, res) {
                            if(res.ok) {
                                obj.status = 'success';
                                obj.message = 'Deine Registrierung ist abgeschlossen, du kannst dich jetzt anmelden.';
                            } else {
                                obj.status = 'error';
                                obj.message = 'Es ist ein Fehler aufgetreten, versuche es erneut.';
                            }

                            clients[device.index].send(JSON.stringify(obj));
                        });
                    } else {
                        obj.status = 'error';
                        obj.message = 'Der Benutzername existiert bereits.';
                        clients[device.index].send(JSON.stringify(obj));
                    }
                });
            }



        } else if(data.method == 'login-user') {
            db.get('user-' + data.username, function (err, doc) {
                var obj = {
                    'method': 'login-user-response'
                };

                if(doc && doc.password == hash("sha512", data.password)) {
                    obj.status = 'success';
                    obj.message = 'Du wurdest erfolgreich angemeldet. Viel Spaß beim Benutzen der App.';
                    obj.user = data;
                    clients[device.index].authorized = true;

                } else {
                    obj.status = 'error';
                    obj.message = 'Die Zugangsdaten sind nicht korrekt.';
                }

                clients[device.index].send(JSON.stringify(obj));
            });
        } else if(data.method == 'movie-play') {
            console.log('movie play');
            // now we have to calc the date difference between the current real time and the the time we
            // need to sync additional content with and then we have to calc everything for this device
            // with the diff
            var nowTimestamp = helper.dateToTimestamp(new Date());
            var virtualStartTimestamp = helper.dateToTimestamp(virtualStart);
                                
            scheduler.reset(virtualStartTimestamp - nowTimestamp + data.start);

        } else if(data.method == 'movie-pause') {
            console.log('movie pause');
            scheduler.stop();
        }
    });

    // user disconnected
    ws.on('close', function(connection) {
        // remove user from the list of connected clients
        delete global.clients[device.index];
        delete global.subscriptions[device.index];

        if(device.type == 'tv') {
            var obj = {
                'method': 'tv-disconnected'
            };

            for (var i=0; i < global.subscriptions.length; i++) {
                if(global.subscriptions[i] == device.tvId) {
                    if(global.clients[i].authorized) {
                        global.clients[i].send(JSON.stringify(obj));
                    }
                }
            }

            delete global.televisions[device.tvId];
            console.log('smart tv ' + device.tvId + ' closed the connection.');
        } else {
            console.log('second screen device closed the connection.');
        }
    });
});

// in live mode, the scheduler can start whenever the sever started, for movies
// it will be started when the movie starts playing
if(mode == 'live') {
    scheduler.start();
}