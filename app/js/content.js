function ContentList(){
    this.content = [];
}

ContentList.prototype.push = function(el) {
    this.content.push(el);
}

ContentList.prototype.top = function() {
    return this.content[this.content.length-1];
}

ContentList.prototype.render = function() {
    $("#contentFreetextTemplate").Chevron("render", {
        'data': this.top() 
    }, function(result){
        $('#content').html(result);       
    });
}