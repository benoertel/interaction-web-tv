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

/**
 * Add an entry to the channel list.
 */
ChannelList.prototype.push = function(el) {
    this.content.push(el);
}

/**
 * Get the first item from the channel list.
 */
ChannelList.prototype.top = function() {
    return this.content[this.content.length-1];
}

/**
 * Initialize the channel list.
 */
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

/**
 * Render the channel list.
 */
ChannelList.prototype.render = function() {
    var context = this;
    $("#channelListTemplate").Chevron("render", {
        'channels': this.channels
    }, function(result){
        $('#channel-list').html(result);

        // re-calculate the width based on the added channels
        var sum = 0;
        $('#channel-list ul li').each( function(){
            sum += $(this).width() + 9;
        });

        $('#channel-list ul').width(sum);
        
        if(context.current) {
            context.selected = context.current;
        } else {
            context.selected = context.channels[0].name;
        }
    });
}

/**
 * Update the selected channel.
 */
ChannelList.prototype.selectedChanged = function(selected) {
    $('#channel-list li a').removeClass('active');
    $('a[data-channel-id=' + selected + ']').addClass('active');
    this.current = selected;
};