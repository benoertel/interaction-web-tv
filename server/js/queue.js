/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var debug = true;

var queue = {};
var pos = 0;
var length = 0;

__updateExportVars();

/**
 * Clear the whole queue.
 */
exports.reset = function() {
    if(debug) {
        console.log('queue: reset()');
    }
    
    queue = {};
    pos = 0;
    length = 0;
}

/**
 * Add a new entry to the queue at timestamp
 */
exports.push = function(timestamp, content) {
    if(debug) {
        console.log('queue: push()');
    }
    
    if(!queue[timestamp]) {
        queue[timestamp] = new Array();
        length++;
    }
    
    queue[timestamp].push(content);
    
    __updateExportVars();
}

/**
 * Get the content that is at the current position.
 */
exports.current = function() {
    if(debug) {
        console.log('queue: current()');
    }
    
    var i = 0;
    for (var idx in queue) {
        if(i == pos) {
            return queue[idx];
        }
        i++;
    }

    return null;
}

/**
 * Get the timestamp of the content that is up next in the queue.
 */
exports.next = function() {
    if(debug) {
        console.log('queue: next()');
        console.log(queue);
    }
    
    var i = 0;
    for (var idx in queue) {
        console.log('lets iterate' + i + '...' + pos);
        if(i == pos + 1) {
            console.log('yep, here we go' + i);
            return parseInt(idx);
        }
        i++;
    }

    return null;
}

/**
 * Get the timestamp of the content at the last queue position.
 */
exports.top = function() {
    if(debug) {
        console.log('queue: top()');
    }
    
    var i = 0;
    for (var idx in queue) {
        if(i == queue.length - 1) {
            return parseInt(idx);
        }
        i++;
    }

    return null;
}

exports.posAdd = function() {
    pos++;
    __updateExportVars();
}

function __updateExportVars() {
    module.exports.pos = pos;
    module.exports.length = length;
}