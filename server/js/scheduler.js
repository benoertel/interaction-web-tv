
var schedule = require('node-schedule');

var queue = require('./queue.js');
var helper = require('./helper.js');
var db = null;

var job = null;
var nowDate = null;

var timeDiff = 0;

exports.init = function(_db) {
    db = _db;
}
exports.stop = function() {
    if(job) {
        job.cancel();
    }
}

exports.reset = function(_timeDiff) {
    if(_timeDiff) {
        timeDiff = _timeDiff;
    }
    queue.reset();
    exports.start();
}

// 1) get content that starts within the next 15 minutes
exports.start = function(startDate, endDate){
    if(timeDiff != 0) {
        console.log('we have a timeDiff of ' + timeDiff + ' seconds.');
    }
    
    if(!nowDate) {
        nowDate = helper.dateToArr(helper.adjustDate(new Date(), timeDiff));
    }
    
    if(!startDate) {
        startDate = nowDate;
    }
    var endDate = helper.dateToArr(helper.addMinutes(helper.arrToDate(startDate), 15));
    console.log(timeDiff);
    console.log(startDate);
    console.log(endDate);
    var context = this;
    
    db.view('content/by-date', {
        startkey: startDate,
        endkey: endDate
    }, function (err, result) {
        if(!err) {
            // when there is no starting task within 15mins, get the next task that starts in the future
            if(result.length == 0) {
                console.log('server.js - initQueue() - no tasks within 15mins');
                console.log(nowDate);
                db.view('content/by-date', {
                    startkey: startDate,
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
                job = schedule.scheduleJob(helper.adjustDate(helper.arrToDate(result[0].value.startDate), -1 * timeDiff), function(){
                    context.distribute();
                });
            }
        } else {
            console.log(err);
        }
    });
    }

// 2) distribute to the second screen devices
exports.distribute = function() {
    var nextTasks = queue.current();
    var context = this;
    
    // distribute to connected devices
    console.log('server.js - distribute() - send tasks to second screen devices:');
    
    for (var idx in nextTasks) {
        var obj = {
            method: 'content-changed',
            channel: nextTasks[idx].value.channel,
            data: nextTasks[idx].value
        };

        for(var tvId in global.televisions) {
            if(global.televisions[tvId] == nextTasks[idx].value.channel) {
                for (var i=0; i < global.subscriptions.length; i++) {
                    if(global.subscriptions[i] == tvId) {
                        if(global.clients[i].authorized) {
                            global.clients[i].send(JSON.stringify(obj));
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
        
        job = schedule.scheduleJob(helper.timestampToDate(queue.next()), function(){
            context.distribute();
        });
    } else {
        console.log('queue is empty for now, no more contents available');
    }
    
    queue.posAdd();
}