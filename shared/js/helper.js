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
    var date = new Date();
    date.setTime (timestamp * 1000);

    return date;
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