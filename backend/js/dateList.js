function DateList(helper){
    this.helper = helper;
    this.currentDay = null;
    this.currentDate = null;
}

DateList.prototype = {
    set selectedDay(selectedDay) {
        this.selectedDayChanged(selectedDay);
    },
    get selectedDay() {
        return this.currentDay;
    },
    set selectedDate(selectedDate) {
        this.selectedDateChanged(selectedDate);
    },
    get selectedDate() {
        return this.currentDate;
    } 
}

DateList.prototype.render = function() {
    var dates = [];
    
    var todayDate = new Date();
    todayDate.setDate(todayDate.getDate() - 1); 
    
    for(var i=1; i<=30; i++) {
        todayDate.setDate(todayDate.getDate() + 1); 
        
        var dd = todayDate.getDate();
        var mm = todayDate.getMonth() + 1;
        var y = todayDate.getFullYear();

        dates.push(dd + '.'+ mm + '.'+ y);
    }

    var context = this;
    $("#dateListTemplate").Chevron("render", { 
        dates: dates 
    }, function(result){
        $('#programme-date').html(result);
        if(context.currentDay) {
            context.selectedDay = context.currentDay;
        } else if(context.currentDate) {
            context.selectedDate = context.currentDate;
        } else {
            var now = new Date();
            context.selectedDay = now.getDay();
        }
    });
}

DateList.prototype.selectedDayChanged = function(selectedDay) {
    $('#programme-date li a').removeClass('active');
    $('a[data-day-id=' + selectedDay + ']').addClass('active');
    $('#programme-date select').val('Datum');
    this.currentDay = selectedDay;
};

DateList.prototype.selectedDateChanged = function(selectedDate) {
    $('#programme-date li a').removeClass('active');
    $('#programme-date select').val(selectedDate);
    this.currentDate = selectedDate;
};