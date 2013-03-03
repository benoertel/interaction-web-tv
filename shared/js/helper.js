function Helper() {
    
};

Helper.prototype.getHashParams = function(){
    var formData = [];

    $.each(window.location.hash.replace("#!/", "").split("&"), function (i, urlParam) {
        urlParam = urlParam.split("=");
        formData[urlParam[0]] = urlParam[1];
    });
    console.log(formData);
    return formData;
}

Helper.prototype.parseHourMin = function(date) {
    return this.pad(date[3], 2) + ':' + this.pad(date[4], 2);
};
    
Helper.prototype.calcDuration = function (start, end, unit) {
    var startDate = new Date(start[0], start[1], start[2], start[3], start[4], start[5]);
    var endDate = new Date(end[0], end[1], end[2], end[3], end[4], end[5]);
    
    var diff = Math.abs(startDate - endDate);

    if(unit == 'min') {
        return Math.floor((diff/1000)/60);
    } else if(unit == 'sec') {
        return Math.floor(diff/1000);
    }
        
    return null;
};
    
Helper.prototype.parseDate = function(date) {
    return date[0] + '/' + date[1] + '/' + date[2] + ' ' + date[3] + ':' + date[4] + ':' + date[5];        
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


Helper.prototype.prepareListData = function(data, date, dateMax) {
    var dataList = [];
    var prevEndTime = '05:00';
        
    var context = this;
    
    // first sort it
    var rows = data.rows;
    rows.sort(sortByDate);


    function sortByDate(a, b){
        var aName = context.arrToDate(a.value.startDate);
        var bName = context.arrToDate(b.value.startDate);
        
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

    $.each(rows, function(index, value) {
            
        var elem = value.value;
        if(!(elem.endDate[0] == date[0] && elem.endDate[1] == date[1] && elem.endDate[2] == date[2] && elem.endDate[3] < 5)){
            var duration = context.calcDuration(elem.startDate, elem.endDate, 'sec');
            if(duration > 60) {
                var startTime = context.parseHourMin(elem.startDate);
                var endTime = context.parseHourMin(elem.endDate);

                var startDate = context.arrToDate(elem.startDate);
                var compDate = context.arrToDate([date[0], date[1], date[2], 5, 0, 0]);
                
                // figure out which shows start too early and cut them to start at 05:00
                if(startDate < compDate) {
                    var durrdiff = context.calcDuration(context.dateToArr(startDate), context.dateToArr(compDate), 'sec');
                    duration -= durrdiff;
                    if(duration <= 0) {
                    ;
                    }
                    startTime = '05:00';
                }
                // figure out which show lasts too long and cut it to the end of the timeline
                compDate = context.arrToDate(dateMax);
                var endDate = context.arrToDate(elem.endDate);
                if(endDate > compDate) {
                    var diff = context.calcDuration(context.dateToArr(compDate), context.dateToArr(endDate), 'sec');
                    duration -= diff;
                }
                    
                if(duration > 60) {
                    
                
                    var width = (duration / 10) - 7;
                    var margin = context.calcTimeDiff(prevEndTime, startTime) * 6 + 1;
                    elem.formatted = {
                        'start': context.parseHourMin(elem.startDate),
                        'duration': (duration/60) + 'min',
                        'width': width,
                        'margin': margin
                    }
                    dataList.push(value.value);
                    prevEndTime = endTime;
                }
            }
        }
            
    });

    return dataList;
}

Helper.prototype.alert = function(type, text, appendTo) {
    $('.alert').remove();
    
    var tpl = '<div class="alert alert-' + type + '"><button type="button" class="close" data-dismiss="alert">×</button>' + text + '</div>';
    $(appendTo).prepend(tpl);
}