/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Convert a date in array notation to the corrsponding unix timestamp.
 */
exports.arrToTimestamp = function(arr) {
    var date = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);

    return date.getTime() / 1000;
};

/**
 * Convert a timestamp to a javascript date object.
 */
exports.timestampToDate = function(timestamp) {
    return new Date(timestamp * 1000);
}

/**
 * Convert a javascript date object to a unix timestamp.
 */
exports.dateToTimestamp = function(date) {
    return Math.round(date.getTime() / 1000);
}

/**
 * Convert a javascript date object to array notation.
 */
exports.dateToArr = function(date) {
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

/**
 * Add minutes to a given javascript date.
 */
exports.addMinutes = function(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

/**
 * Subtract minutes from a given javascript date.
 */
exports.subMinutes = function(date, minutes) {
    return new Date(date.getTime() - minutes*60000);
}

/**
 * Convert a date a array to a javascript date object.
 */
exports.arrToDate = function(arr) {
    var date = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);

    return date;
}

/**
 * Adjust a javascript date object by a given amount of seconds.
 */
exports.adjustDate = function(date, diff) {
    date.setTime(date.getTime() + diff * 1000);
    
    return date;
}

/**
 * Adjust a javascript timestamp by a given amount of seconds.
 */
exports.adjustTimestamp = function(timestamp, diff) {
    return timestamp + diff;
}

/**
 * Parse arguments from command line into an array
 */
exports.parseArgs = function(arguments) {
    var response = [];
    
    arguments.forEach(function (val, index, array) {
        var value = val.match(/[^=]+$/g);
        var param = val.match(/^[a-z-]+[^=]/g);
        
        response[param[0].substr(2)] = value[0];
    });
    
    return response;
}