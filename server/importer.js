var fs = require('fs');
var xml2js = require('xml2js');
var cradle = require('cradle');
var libxmljs = require("libxmljs");
var expat = require('node-expat');
var util = require('util');

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');


var region = null;
var xmlfile = null;
var channels = [
    'ard-hd',
    'rtl-hd',
    'rtl-ii-hd',
    'zdf-hd',
    'sat-1-hd',
    'vox-hd',
    'n-tv',
    'n24-hd',
    'kabel-eins-hd'
];

// read command line args and parse them
var arguments = process.argv.splice(2);
arguments.forEach(function (val, index, array) {
    var value = val.match(/[^=]+$/g);
    var param = val.match(/^[a-z-]+[^=]/g);

    if(value && param) {
        if(param[0] == '--region') {
            region = value[0];
        } else if(param[0] == '--xmlfile') {
            xmlfile = value[0];
        }
    }
});

if(!region || !xmlfile) {
    console.log('Region and xml file have to be specified, follow readme.');

} else {

    var p = expat.createParser();

    var channel = null;
    
    var programme = {
        id: null,
        attr: null,
        children: []
    };
    
    var lastNode = null;

    
    p.on('startElement', function(name, attr) {
        if(name == 'channel') {
         //   console.log(attr.slug);
        }
        if(name == 'channel' && attr.region == region && inArray(attr.slug, channels)) {
            channel = attr.slug;
        } else if(name == 'programme' && channel) {
            programme.id = attr.id;
            programme.attr = attr; 
        } else if(programme) {
            if(name == 'title' || name == 'desc' || name == 'category' || name == 'date' || name == 'subtitle') {
                lastNode = name;
            }
        }
    }.bind(this));
    
    p.on('text', function(text) {
        if(lastNode) {
            programme.children[lastNode] = text;
        }
    }.bind(this));

    p.on('endElement', function(name) {
        if(name == 'channel') {
            channel = null;
            
        } else if(name == 'programme' && programme.id) {
            persistProgramme(programme, channel);

            programme = {
                id: null,
                attr: null,
                children: []
            };
        }
        lastNode = null;
    }.bind(this));
    
    p.on('end', function() {
        console.log('done');
    }.bind(this));
    
    var mystic = fs.createReadStream(__dirname + '/../data/epg/' + xmlfile);
    mystic.pipe(p);

    /**
     * Save the content of a programme to the dabase.
     */
    function persistProgramme(programme, channel) {
        var id = programme.id;
        var title = (programme.children['title']) ? programme.children['title'] : '';
        var subtitle = (programme.children['subtitle']) ? programme.children['subtitle'] : '';
        var desc = (programme.children['desc']) ? programme.children['desc'] : '';

        var start = programme.attr['start'];
        var stop = programme.attr['stop'];
        var date = (programme.children['date']) ? programme.children['date'] : '';

        var doc = {
            type: 'show',
            title: title,
            subtitle: subtitle,
            desc: desc,
            startDate: dateToArr(start),
            endDate: dateToArr(stop),
            channel: channel
        }
        db.save('show-' + id, doc, function (err, res) {});
    }
    
    /**
     * Check whether a needle is in an array.
     */
    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }
    
    /**
     * Transform a javascript date string to an array.
     */
    function dateToArr(date) {
        var arr = [
           parseInt(date.substr(0, 4), 10),
           parseInt(date.substr(4, 2), 10)-1,
           parseInt(date.substr(6, 2), 10),
           parseInt(date.substr(8, 2), 10),
           parseInt(date.substr(10, 2), 10),
           parseInt(date.substr(12, 2), 10)
        ];

        return arr;
    }
}