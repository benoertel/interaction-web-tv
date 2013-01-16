/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var cradle = require('cradle');

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');

/* Delete non-design documents in a database. */
db.all(function(err, doc) {
    /* Loop through all documents. */
    for(var i = 0; i < doc.length; i++) {
        /* Don't delete design documents. */
        if(doc[i].id.indexOf("_design") == -1 && doc[i].id.indexOf("user-") == -1 && doc[i].id.indexOf("channelList") == -1) {
            db.remove(doc[i].id, doc[i].value.rev, function(err, doc) {
                
                });
        }
    }
console.log('cleaned');
});
