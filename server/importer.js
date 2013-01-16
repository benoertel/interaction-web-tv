var fs = require('fs');
var xml2js = require('xml2js');
var cradle = require('cradle');
var libxmljs = require("libxmljs");

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');

var expat = require('node-expat');
var util = require('util');
var fs = require('fs');

var region = null;
var xmlfile = null;

var channels = [
    'ard-hd',
    'rtl-hd',
    'rtl2-hd',
    'zdf-hd'
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

    function persistProgramme(programme, channel) {

        var id = programme.id;
        var title = (programme.children['title']) ? programme.children['title'] : '';
        var subtitle = (programme.children['subtitle']) ? programme.children['subtitle'] : '';
        var desc = (programme.children['desc']) ? programme.children['desc'] : '';

        var start = programme.attr['start'];
        var stop = programme.attr['stop'];
        var date = (programme.children['date']) ? programme.children['date'] : '';

        start = dateToArr(new Date(start.substr(0, 4) + '-' + start.substr(4, 2) + '-' + start.substr(6, 2) + ' ' + start.substr(8, 2) + ':' + start.substr(10, 2) + ':' + start.substr(12, 2)));
        stop = dateToArr(new Date(stop.substr(0, 4) + '-' + stop.substr(4, 2) + '-' + stop.substr(6, 2) + ' ' + stop.substr(8, 2) + ':' + stop.substr(10, 2) + ':' + stop.substr(12, 2)));

        var doc = {
            type: 'show',
            title: title,
            subtitle: subtitle,
            desc: desc,
            startDate: start,
            endDate: stop,
            channel: channel
        }
        db.save('show-' + id, doc, function (err, res) {});
    }
    
    function inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }
    
    function dateToArr(date) {
        var arr = [
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),

        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
        ];

        return arr;
    }
}