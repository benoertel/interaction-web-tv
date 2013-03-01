function Helper() {
    
};

Helper.prototype.getHashParams = function(){
    var formData = [];

    $.each(window.location.hash.replace("#", "").split("&"), function (i, urlParam) {
        urlParam = urlParam.split("=");
        formData[urlParam[0]] = urlParam[1];
    });
        
    return formData;
}

Helper.prototype.parseHourMin = function(date) {
    return pad(date[3], 2) + ':' + pad(date[4], 2);
};
    
Helper.prototype.calcDuration = function (start, end, unit) {
    var diff = Math.abs(new Date(parseDate(start)) - new Date(parseDate(end)));
        
    if(unit == 'min') {
        return Math.floor((diff/1000)/60);
    }
        
    return null;
};
    
Helper.prototype.parseDate = function(date) {
    var dateTime = date.split(' ');
    var datePart = dateTime[0].split('-');

    return datePart[0] + '/' + datePart[1] + '/' + datePart[2] + ' ' + dateTime[1];        
};

Helper.prototype.formatDate = function(date) {
    var dateTime = date.split(' ');
    var datePart = dateTime[0].split('.');

    return datePart[2] + '-' + datePart[1] + '-' + datePart[0] + ' ' + dateTime[1];
}

Helper.prototype.calcTimeDiff = function(start, end) {
    var startTime = start.split(':');
    var endTime = end.split(':');

    var startx = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
    var endx = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);

    var duration = endx - startx

    if(duration < 0){
        duration = duration + 1440;
    }

    return duration;
}
    
Helper.prototype.pad = function(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}
    
Helper.prototype.dateToArr = function(date) {
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

Helper.prototype.arrToDate = function(arr) {
    var date = new Date(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);

    return date;
}

Helper.prototype.createAlert = function(type, text) {
    var classes = 'alert ';
        
    if(type == 'error') {
        classes += ' alert-error';
    } else if(type == 'success') {
        classes += 'alert-success';
    }
        
    return '<div class="' + classes + '">' + text + '</div>';
}

Helper.prototype.ucfirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 */
Helper.prototype.randId = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i=0; i < 16; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return text;
}

Helper.prototype.prepareCouchData = function(data) {
    var doc = {};

    $.each(data, function(index, value) {
        doc[value.name] = value.value;
    });

    return doc;
}