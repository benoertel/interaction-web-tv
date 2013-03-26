function BookmarkList() {
    this.bookmarks = [];
};

/**
 * Add a new entry to the bookmark list.
 */
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

/**
 * Load entries to the bookmark list from local storage.
 */
BookmarkList.prototype.load = function(displayActions) {
    this.bookmarks = $.totalStorage('bookmarks');
    if(!this.bookmarks) {
        this.bookmarks = [];
    }
        
    $('#bookmarksTemplate').Chevron('render', {
        'bookmarks': this.bookmarks
    }, function(result){
        $('#bookmarks').html(result);
        if(displayActions) {
            $('#bookmarks .remove').show();
        }
    });
}

/**
 * Toggle whether to show or hide the remove buttons.
 */
BookmarkList.prototype.toggleRemove = function() {
    $('#bookmarks .remove').toggle();
        
    return false;
}
    
/**
 * Remove an element from the bookmark list.
 */
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