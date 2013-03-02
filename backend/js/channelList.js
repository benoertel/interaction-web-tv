function ChannelList(helper){
    this.channels = [];
    this.current = null;
    this.helper = helper;
}

ChannelList.prototype = {
    set selected(selected) {
        this.selectedChanged(selected);
    },
    get selected() {
        return this.current;
    }  
}

ChannelList.prototype.push = function(el) {
    this.content.push(el);
}

ChannelList.prototype.top = function() {
    return this.content[this.content.length-1];
}

ChannelList.prototype.load = function() {
    var context = this;
    $.couch.db("persad").openDoc("channelList", {
        success: function(data) {
            context.channels = data.channels;
            context.render();
        },
        error: function(status) {
            console.log('error loading channels');
            console.log(status);
        }
    });
}

ChannelList.prototype.render = function() {
    var context = this;
    $("#channelListTemplate").Chevron("render", {
        'channels': this.channels
    }, function(result){
        $('#channel-list').html(result);

        // re-calculate the width based on the added channels
        var sum = 0;
        $('#channel-list ul li').each( function(){
            sum += $(this).width() + 4;
        });

        $('#channel-list ul').width(sum);
        
        if(context.current) {
            context.selected = context.current;
        } else {
            context.selected = context.channels[0].name;
        }
    });
}

ChannelList.prototype.selectedChanged = function(selected) {
    $('#channel-list li a').removeClass('active');
    $('a[data-channel-id=' + selected + ']').addClass('active');
    this.current = selected;
};