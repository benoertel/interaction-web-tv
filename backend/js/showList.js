function ShowList(helper){
    this.helper = helper;
}

ShowList.prototype.load = function(date, channel) {
    console.log(date);
    console.log(channel);
    this.channel = 'ard-hd';
    this.date = [2012, 9, 19]; 
    this.render();
}

ShowList.prototype.render = function() {
    var context = this;
    var day = new Date(this.date);
    day.setDate(day.getDate() + 1);
    
    var startDate = [this.date[0], this.date[1], this.date[2], 0, 0, 0];
    var endDate = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getDate(), 5,0,0];
    
    $.couch.db("persad").view("show/by-channel", {
        'startkey': [context.channel,startDate],
        'endkey': [context.channel,endDate],
        'ascending': true,
        success: function(data) {
            console.log(data);
            var dataList = context.helper.prepareListData(data, context.date);

            $("#showListTemplate").Chevron("render", {
                'shows': dataList
            }, function(result){
                $('#guide #show-list').html(result);
            });
        },
        error: function(status) {
            console.log(status);
        }
    });
}