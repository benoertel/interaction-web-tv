function ContentList(helper){
    this.content = [];
    this.helper = helper;
}

/**
 * Add an entry to the end of the content list.
 */
ContentList.prototype.push = function(el) {
    this.content.push(el);
}

/**
 * Get the last entry from the content list.
 */
ContentList.prototype.top = function() {
    return this.content[this.content.length-1];
}

/**
 * Render the latest entry from the content list.
 */
ContentList.prototype.render = function() {
    var content = this.top();
    var tpl = (content && content.category) ? this.helper.ucfirst(content.category) : 'Freetext';
    
    $('#content' + tpl + 'Template').Chevron('render', {
        'data': this.top() 
    }, function(result){
        $('#content').html(result);       
    });
}