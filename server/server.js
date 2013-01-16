
process.title = 'node-persad';

var server = require('websocket').server;
var http = require('http');
var cradle = require('cradle');
var hash = require("mhash").hash;
var schedule = require('node-schedule');

// init global vars
var televisions = [];
var subscriptions = [];
var clients = [];

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

            // a second-screen device subscribes to a smart tv
            if(data.method == 'subscribe') {
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

            //resetQueue();
            //initQueue();

            // content of a channel was updated in backend
            } else if(data.method == 'channel-content-updated') {

                db.view('content/by-channel', {
                    key: data.channel
                }, function (err, result) {
                    resetQueue();
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
                                    obj.message = 'Youre registration was finished. Login and enjoy.';
                                } else {
                                    obj.status = 'error';
                                    obj.message = 'Error during registration, try again.';
                                }

                                clients[device.index].send(JSON.stringify(obj));
                            });
                        } else {
                            obj.status = 'error';
                            obj.message = 'Username already in use.';
                            clients[device.index].send(JSON.stringify(obj));
                        }
                    });
                }



            } else if(data.method == 'login-user') {
                var id = 'user-' + data.username;
                db.get(id, function (err, doc) {
                    var obj = {
                        'method': 'login-user-response'
                    };

                    if(doc && doc.password == hash("sha512", data.password)) {
                        obj.status = 'success';
                        obj.message = 'You were logged in successfully. Enjoy using the app.';
                        obj.user = data;
                        clients[device.index].authorized = true;

                    } else {
                        obj.status = 'error';
                        obj.message = 'The provided credentials are incorrect.';
                    }

                    clients[device.index].send(JSON.stringify(obj));
                });

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



// #############
// # scheduler #
// #############

/**
 * Initialize the priority queue with all content that starts within next 15 min.
 */
function initPriorityQueue() {

}

/**
 * Update new contents into the priority queue.
 */
function updatePriorityQueue() {

}

//startDateNextTask
/*
scheduleTask(startDateNextTask);

function scheduleTask(date) {
    var j = schedule.scheduleJob(date, function(){
        console.log('The answer to life, the universe, and everything!');

        date.setSeconds(date.getSeconds() + 5);
        createJob(date);
    });
}


/**
 * Schedule the next content to be sent to
 */
function scheduleContent() {
    var date = new Date(2012, 11, 21, 21, 56, 00);
    createJob(date);

    var j = schedule.scheduleJob(date, function(){
        console.log('The answer to life, the universe, and everything!');

        date.setSeconds(date.getSeconds() + 5);
        createJob(date);
    });
}

// 1) get content that already started and is still running (independent of channel)

// 2) schedule next update to next content start date in the db

// 3)

var contentQueue = {};
var currentQueuePos = 0;

initQueue();

function resetQueue() {
    contentQueue = {};
    currentQueuePos = 0;
    
    console.log('reset queue');
}

// 1) get content that starts within the next 15 minutes
function initQueue(startDate, nowDate) {
    if(!nowDate) {
        nowDate = new Date();
    }
    
    if(!startDate) {
        startDate = dateToArr(nowDate);
    }
    var endDate = dateToArr(addMinutes(arrToDate(startDate), 15));
    
    console.log(startDate);
    console.log(endDate);
    
    db.view('content/by-date', {
        startkey: startDate,
        endkey: endDate
    }, function (err, result) {
        if(!err) {
            // when there is no starting task within 15mins, get the next task that starts in the future
            if(result.length == 0) {
                db.view('content/by-date', {
                    startkey: dateToArr(nowDate),
                    limit: 1
                }, function (suberr, subresult) {
                    if(!suberr) {
                        if(subresult.length == 1) {
                            initQueue(subresult[0].value.startDate);
                        }
                    } else {
                        console.log(suberr);
                    }
                });
            } else {
                var length = getLength(contentQueue);
                
                for(var idx in result) {
                    queueContent(result[idx]);
                }
                
                // in case the queue is empty, restart
                console.log('current length' + length);
                if(length == 0) {
                    // when the queue is filled up, start the distribution scheduler
                    var jk = schedule.scheduleJob(arrToDate(result[0].value.startDate), function(){
                        distributeContent();
                    });
                }
            }
        } else {
            console.log(err);
        }
    });
}

// add a content to the queue
function queueContent(content) {
    var startTimestamp = arrToTimestamp(content.value.startDate);
    if(!contentQueue[startTimestamp]) {
        contentQueue[startTimestamp] = new Array();
    }

    contentQueue[startTimestamp].push(content);
}

// 2) initialize the distributon to the second screen devices
function distributeContent() {
    var nextTasks = getAtPos(contentQueue, currentQueuePos);
    
    // distribute to connected devices
    console.log('send tasks to second screen devices:');
    
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
    var nextTaskTimestamp = getIndexAtPos(contentQueue, currentQueuePos + 1);
    if(nextTaskTimestamp) {
        // when the pre-last task is reached, refill the queue
        var length = getLength(contentQueue);
        console.log((currentQueuePos + 1) + ' ... ' + (length));
        if(currentQueuePos + 1 == length - 1) {
            console.log('refill queue');
            var lastTaskTimestamp = getIndexAtPos(contentQueue, length - 1);
            var startDate = timestampToDate(lastTaskTimestamp + 1);
            initQueue(dateToArr(startDate), startDate);
        }
            
        var nextTaskDate = timestampToDate(nextTaskTimestamp);
        var j = schedule.scheduleJob(nextTaskDate, function(){
            currentQueuePos++;
            distributeContent();
        });
    } else {
        console.log('queue is empty for now, no more contents available');
    }
}

function getAtPos(obj, pos) {
    count = 0;
    for (var idx in obj) {
        if(count == pos) {
            return obj[idx];
        }
        count++;
    }

    return null;
}

function getIndexAtPos(obj, pos) {
    count = 0;
    for (var idx in obj) {
        if(count == pos) {
            return parseInt(idx);
        }
        count++;
    }

    return null;
}

function getLength(obj) {
    count = 0;
    for (var idx in obj) {
        count++;
    }

    return count;
}


// ##########
// # helper #
// ##########

function dateToArr(date) {
    var arr = [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),

    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
    ];

    return arr;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function subMinutes(date, minutes) {
    return new Date(date.getTime() - minutes*60000);
}

function arrToDate(arr) {
    var date = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);

    return date;
}

function arrToTimestamp(arr) {
    var date = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);

    return date.getTime() / 1000;
}

function timestampToDate(timestamp) {
    var date = new Date();
    date.setTime (timestamp * 1000);

    return date;
}