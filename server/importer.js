var fs = require('fs');
var xml2js = require('xml2js');
var cradle = require('cradle');

// setup db connection
var db = new(cradle.Connection)('http://localhost', 5984, {
    cache: true,
    raw: false
}).database('persad');

var parser = new xml2js.Parser();

fs.readFile(__dirname + '/../data/epg/2012-10-19.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        
        for (var i in result.tv.channel) {
            var channel = result.tv.channel[i];
            var programmes = channel.programmes[0].programme;
            
            for (var p in programmes) {                
                persistProgramme(programmes[p], channel['$']['slug']);
            }
        }
        
        console.log('Done');
    });
});


function persistProgramme(programme, channel) {
    var id = programme['$']['id'];
    var title = (programme['title']) ? programme['title'][0]['_'] : '';
    var subtitle = (programme['sub-title']) ? programme['sub-title'][0]['_'] : '';
    var desc = (programme['desc']) ? programme['desc'][0]['_'] : '';

    var start = programme['$']['start'];
    var stop = programme['$']['stop'];
    var date = (programme['date']) ? programme['date'][0]['_'] : '';

    start = start.substr(0, 4) + '-' + start.substr(4, 2) + '-' + start.substr(6, 2) + ' ' + start.substr(8, 2) + ':' + start.substr(10, 2) + ':' + start.substr(12, 2);
    stop = stop.substr(0, 4) + '-' + stop.substr(4, 2) + '-' + stop.substr(6, 2) + ' ' + stop.substr(8, 2) + ':' + stop.substr(10, 2) + ':' + stop.substr(12, 2);
    date = date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2);

    var doc = {
        type: 'show',
        title: title,
        subtitle: subtitle,
        desc: desc,
        start: start,
        end: stop,
        date: date,
        channel: channel
    }
    
    db.save('show-' + id, doc, function (err, res) {});
}