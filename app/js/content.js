function ContentList(){
    this.latest = null;
}

ContentList.prototype = {
    get top(){
        return this._latest;
    },
    
    set top(data) {
        this._latest = data;
    }
}

ContentList.prototype.changed = function(data) {
    if(data) {
        this.latest = data;
    }
    $("#contentFreetextTemplate").Chevron("render", {
        'data': data 
    }, function(result){
        $('#content').html(result);       
    });
}

ContentList.prototype.top = function(){
    return this.latest;
}

ContentList.prototype.prepareData = function(data) {
    data.formatted = {
        'start': helper.parseHourMin(data.startDate),
        'duration': helper.calcDuration(data.startDate, data.endDate, 'min')
    }
        
    return data;
}
    