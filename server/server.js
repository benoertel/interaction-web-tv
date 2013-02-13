
process.title = 'node-persad';

var server = require('websocket').server;
var http = require('http');
var cradle = require('cradle');
var hash = require("mhash").hash;
var schedule = require('node-schedule');
var helper = require('../js/helper.js');
var queue = require('./js/queue.js');

// init global vars
var televisions = [];
var subscriptions = [];
var clients = [];

var timeDiff = 0;
var j = null;

// read command line args and parse them
var args = helper.parseArgs(process.argv.splice(2));

var mode = args.mode ? args.mode : 'television';
var virtualStart = args.date ? args.date : null;
var channel = args.channel ? args.channel : null;
var movieFile = args.file ? args.file : null;

console.log('server.js - running in mode: ' + mode);

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');

// create server
var httpServer = http.createServer();
httpServer.listen(1337, function() {
    console.log((new Date()) + " Server is listening on port " + 1337);
});

var websocketServer = new server({
    httpServer: httpServer
});

// websocket server
websocketServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);

    // we need to know client index to remove them on 'close' event
    var device = {
        'index': clients.push(connection) - 1,
        'type': null
    };

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
            
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
                
                connection.send(JSON.stringify(obj));
            
            // a second-screen device subscribes to a smart tv
            } else if(data.method == 'subscribe') {
                device.type = 'secondScreen';

                subscriptions[device.index] = data.tvId;

                var obj = {
                    'method': 'subscribe-response'
                };

                // check if tvId exists
                if(televisions[data.tvId]) {
                    // send back, send in next response the current channel
                    db.view('content/by-channel', {
                        key: televisions[data.tvId]
                    }, function (err, result) {
                        obj.status = 'success';
                        obj.message = 'Remote Smart-TV is available.';
                        obj.tv = {
                            'channel': televisions[data.tvId],
                            'data': result
                        };

                        connection.send(JSON.stringify(obj));
                    });
                } else {
                    obj.status = 'error';
                    obj.message = 'Remote Smart-TV currently not available';
                    connection.send(JSON.stringify(obj));
                }

            // channel change on smart tv
            } else if(data.method == 'channel-changed') {
                if(!televisions[data.tvId]) {
                    device.type = 'tv';
                    device.tvId = data.tvId;
                    // when it is a new device, we need to notify all second screen
                    // devices, that are waiting for this device
                    console.log('smart tv ' + data.tvId + ' is online');
                }

                televisions[data.tvId] = data.channel;

                var obj = {
                    method: 'channel-changed',
                    channel: data.channel
                };

                for (var i=0; i < subscriptions.length; i++) {
                    if(subscriptions[i] == data.tvId) {
                        if(clients[i].authorized) {
                            clients[i].send(JSON.stringify(obj));
                        }
                    }
                }

            // content of a channel was updated in backend
            } else if(data.method == 'channel-content-updated') {

                db.view('content/by-channel', {
                    key: data.channel
                }, function (err, result) {
                    queue.reset();
                    initQueue();
                    
                });
            } else if(data.method == 'register-user') {
                var obj = {
                    'method': 'register-user-response'
                };

                if(!data.username || !data.password) {
                    obj.status = 'error';
                    obj.message = 'Username and password are required.';
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
                var now = new Date();
                var nowTimestamp = helper.dateToTimestamp(now);
                timeDiff = data.start - nowTimestamp;
                
                initQueue();
                                
            } else if(data.method == 'movie-pause') {
                console.log('movie pause');
                
                if(j) {
                    j.cancel();
                }
                queue.reset();
            } else if(data.method == 'display-link') {                
                var obj = {
                    'method': 'display-link',
                    'data': {
                        'title': 'Auswertung',
                        'text':     '<img src="/app/img/amazoncard.png" />' + 
                                    '<p>Vielen Dank für die Teilnahme am Usability-Test, bitte fülle nun den Fragebogen zum Test aus.</p>' +
                                    '<p style="color: #f9963f">Unter allen Teilnehmern wird ein Amazon Gutschein i.H.v. 30 Euro verlost.</p>' +
                                    '<p style="font-size: 10px">Für Teilnahme am Gewinnspiel ist die Angabe einer validen E-Mail-Adresse notwendig!</p>',
                        'linkText': 'zum Fragebogen',
                        'link': 'https://de.surveymonkey.com/s/HBPMFGY'
                    }
                }
                
                for (var i=0; i < subscriptions.length; i++) {
                    if(subscriptions[i] == data.tvId) {
                        if(clients[i].authorized) {
                            clients[i].send(JSON.stringify(obj));
                        }
                    }
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        // remove user from the list of connected clients
        delete clients[device.index];
        delete subscriptions[device.index];

        if(device.type == 'tv') {
            var obj = {
                'method': 'tv-disconnected'
            };

            for (var i=0; i < subscriptions.length; i++) {
                if(subscriptions[i] == device.tvId) {
                    if(clients[i].authorized) {
                        clients[i].send(JSON.stringify(obj));
                    }
                }
            }

            delete televisions[device.tvId];
            console.log('smart tv ' + device.tvId + ' closed the connection.');
        } else {
            console.log('second screen device closed the connection.');
        }
    });

    // connection error
    connection.on('error', function(connection) {
        console.log('connection error.');
    });
});

// ##################
// ### SCHEDULER ####
// ##################

if(mode == 'television') {
    initQueue();
}

// 1) get content that starts within the next 15 minutes
function initQueue(startDate, nowDate) {
    if(timeDiff > 0) {
        console.log('we have a timeDiff of ' + timeDiff + ' seconds.');
    }
    
    if(!nowDate) {
        nowDate = helper.dateToArr(helper.adjustDate(new Date(), timeDiff));
    }
    
    if(!startDate) {
        startDate = nowDate;
    }
    var endDate = helper.dateToArr(helper.addMinutes(helper.arrToDate(startDate), 15));
    
    console.log(startDate);
    console.log(endDate);
    
    db.view('content/by-date', {
        startkey: startDate,
        endkey: endDate
    }, function (err, result) {
        console.log(result);
        if(!err) {
            // when there is no starting task within 15mins, get the next task that starts in the future
            if(result.length == 0) {
                console.log('server.js - initQueue() - no tasks within 15mins');
                console.log(nowDate);
                db.view('content/by-date', {
                    startkey: nowDate,
                    limit: 1
                }, function (suberr, subresult) {
                    if(!suberr) {
                        // when the subresult length is 0, we can stop at this point, no tasks in the future
                        if(subresult.length == 1) {
                            initQueue(subresult[0].value.startDate);
                        }
                    } else {
                        console.log(suberr);
                    }
                });
            } else {
                console.log('server.js - initQueue() - found tasks within 15mins');
                for(var idx in result) {
                    var timestamp = helper.adjustTimestamp(helper.arrToTimestamp(result[idx].value.startDate), -1 * timeDiff);
                    console.log('server.js - the new scheduled date is ' + new Date(timestamp * 1000));
                    console.log('server.js - initQueue() - timestamp' + timestamp);

                    queue.push(timestamp, result[idx]);
                }
                
                console.log('server.js - initQueue() - current length' + queue.length);
                j = schedule.scheduleJob(helper.adjustDate(helper.arrToDate(result[0].value.startDate), -1 * timeDiff), function(){
                    distributeContent();
                });
            }
        } else {
            console.log(err);
        }
    });
}

// 2) initialize the distributon to the second screen devices
function distributeContent() {
    var nextTasks = queue.current();
    
    // distribute to connected devices
    console.log('server.js - distributeContent() - send tasks to second screen devices:');
    
    for (var idx in nextTasks) {
        var obj = {
            method: 'content-changed',
            channel: nextTasks[idx].value.channel,
            data: nextTasks[idx].value
        };

        for(var tvId in televisions) {
            if(televisions[tvId] == nextTasks[idx].value.channel) {
                for (var i=0; i < subscriptions.length; i++) {
                    if(subscriptions[i] == tvId) {
                        if(clients[i].authorized) {
                            clients[i].send(JSON.stringify(obj));
                            console.log('- ' + nextTasks[idx].value.title);
                        }
                    }
                }
            }
        }
    }
    
    // get the time of the very next task
    if(queue.next()) {
        // when the pre-last task is reached, refill the queue
        console.log((queue.pos) + ' ... ' + (queue.length - 1));
        
        if(queue.pos == queue.length - 1) {
            console.log('refill queue');
            var startDate = helper.timestampToDate(queue.top() + 1);
            initQueue(helper.dateToArr(startDate), startDate);
        }
        
        j = schedule.scheduleJob(helper.timestampToDate(queue.next()), function(){
            distributeContent();
        });
    } else {
        console.log('queue is empty for now, no more contents available');
    }
    
    queue.posAdd();
}

