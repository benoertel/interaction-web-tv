function ContentList(helper){
    this.content = [];
    this.helper = helper;
}

ContentList.prototype.push = function(el) {
    this.content.push(el);
}

ContentList.prototype.top = function() {
    return this.content[this.content.length-1];
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