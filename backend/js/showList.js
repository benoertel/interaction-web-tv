function ShowList(helper){
    this.helper = helper;
}

ShowList.prototype.load = function(date, channel) {
    this.channel = channel;
    this.date = date; 
    this.render();
}

/**
 * Render the show list.
 */
ShowList.prototype.render = function() {
    var context = this;
    var day = new Date(this.date[0], this.date[1], this.date[2]);
    day.setDate(day.getDate() + 1);
    
    var startDate = [this.date[0], this.date[1], this.date[2], 0, 0, 0];
    var endDate = [day.getUTCFullYear(), day.getUTCMonth(), day.getDate(), 5,0,0];
    
    $.couch.db("persad").view("show/by-channel", {
        'startkey': [context.channel,startDate],
        'endkey': [context.channel,endDate],
        'ascending': true,
        success: function(data) {
            var dataList = context.helper.prepareListData(data, context.date, endDate);

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