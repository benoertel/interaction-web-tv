function BookmarkList() {
    this.bookmarks = [];
};

BookmarkList.prototype.push = function(data) {
    for(var idx in this.bookmarks) {
        if(this.bookmarks[idx].id == data._id) {
            return;
        }
    }
        
    this.bookmarks.push({
        'id': data._id,
        'link': data.extLink,
        'title': data.title,
        'image': data.thumb
    });
    
    $.totalStorage('bookmarks', this.bookmarks);
    this.load(false);
}
    
BookmarkList.prototype.load = function(displayActions) {
    this.bookmarks = $.totalStorage('bookmarks');
    if(!this.bookmarks) {
        this.bookmarks = [];
    }
        
    $("#bookmarksTemplate").Chevron("render", {
        'bookmarks': this.bookmarks
    }, function(result){
        $('#bookmarks').html(result);
        if(displayActions) {
            $('#bookmarks .remove').show();
        }
    });
}
    
BookmarkList.prototype.toggleRemove = function() {
    $('#bookmarks .remove').toggle();
        
    return false;
}
    
BookmarkList.prototype.remove = function(id) {
    for(var idx in this.bookmarks) {
        if(this.bookmarks[idx].id == id) {
            this.bookmarks.splice(idx, 1);
            break;
        }
    }
    $.totalStorage('bookmarks', this.bookmarks);
    this.load(true);

    return false;
}