function TimeList(helper){
    this.helper = helper;
}

TimeList.prototype.render = function() {
    var times = [];

    for(var i=5; i<=28; i++) {
        var hour = i;
        if(i > 23) {
            hour -= 24;
        }
        for(var minute=0; minute<=30; minute+=30) {
            times.push(this.helper.pad(hour, 2) + ':' + this.helper.pad(minute,2));
        }
    }
                                
    $("#timeListTemplate").Chevron("render", { 
        times: times 
    }, function(result){
        $('#guide #time-list').html(result);
    });
}