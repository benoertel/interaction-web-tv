function ContentList(helper){
    this.helper = helper;
}

ContentList.prototype.load = function(date, channel) {
    this.channel = channel;
    this.date = date;
    this.render();
}

ContentList.prototype.render = function() {
    var context = this;
    var day = new Date(this.date[0], this.date[1], this.date[2]);
    day.setDate(day.getDate() + 1);
    
    var startDate = [this.date[0], this.date[1], this.date[2], 0, 0, 0];
    var endDate = [day.getUTCFullYear(), day.getUTCMonth(), day.getDate(), 5,0,0];

    $.couch.db("persad").view("content/by-channel", {
        'startkey': [context.channel, startDate],
        'endkey': [context.channel, endDate],
        'ascending': true,
        success: function(data) {
            var dataList = context.seperateTargetGroups(data, endDate);
                       
            $("#contentListTemplate").Chevron("render", {
                'targets': dataList
            }, function(result){
                $('#guide #content-list').html(result);
            });
        },
        error: function(status) {
            console.log(status);
        }
    });
}

ContentList.prototype.seperateTargetGroups = function(data, endDate) {
    var result = [];

    var allList = [];
    var childrenList = [];
    var teenagerList = [];
    var adultsList = [];
    var elderlyList = [];

    $.each(data.rows, function(index, value) {
        var elem = value.value;
        if(elem.ageRange == 'all') {
            allList.push({value: elem});
        } else if(elem.ageRange == 'children') {
            childrenList.push({value: elem});
        } else if(elem.ageRange == 'teenager') {
            teenagerList.push({value: elem});
        } else if(elem.ageRange == 'adults') {
            adultsList.push({value: elem});
        } else if(elem.ageRange == 'elderly') {
            elderlyList.push({value: elem});
        }
    });
    
    if(allList.length > 0) {
        var allListData = this.helper.prepareListData({rows: allList}, this.date, endDate);
        result.push({name: 'all', contents: allListData});
    }
    if(childrenList.length > 0) {
        var childrenListData = this.helper.prepareListData({rows: childrenList}, this.date, endDate);
        result.push({name: 'children', contents: childrenListData});
    }
    if(teenagerList.length > 0) {
        var teenagerListData = this.helper.prepareListData({rows: teenagerList}, this.date, endDate);
        result.push({name: 'teenager', contents: teenagerListData});
    }
    if(adultsList.length > 0) {
        var adultsListData = this.helper.prepareListData({rows: adultsList}, this.date, endDate);
        result.push({name: 'adults', contents: adultsListData});
    }
    if(elderlyList.length > 0) {
        var elderlyListData = this.helper.prepareListData({rows: elderlyList}, this.date, endDate);
        result.push({name: 'elderly', contents: elderlyListData});
    }
    
    return result;
}