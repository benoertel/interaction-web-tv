function ContentList(helper){
    this.content = [];
    this.helper = helper;
    this.date = '';
}

ContentList.prototype.push = function(el) {
    if(el.date == this.date) {
        this.content.push(el);
    }
    
    // always persist pushed contents to database
}

ContentList.prototype.top = function() {
    return this.content[this.content.length-1];
}

ContentList.prototype.remove = function() {
    
}

ContentList.prototype.render = function() {
    var content = this.top();
    var tpl = (content && content.category) ? this.helper.ucfirst(content.category) : 'Freetext';
    
    $('#content' + tpl + 'Template').Chevron('render', {
        'data': this.top() 
    }, function(result){
        $('#content').html(result);       
    });
}