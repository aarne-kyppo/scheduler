var fs = require('fs');
var through = require('through');
var _ = require('underscore');
var Transform = require('stream').Transform
  , csv = require('csv-streamify')
  , JSONStream = require('JSONStream');
module.exports = function(filepath, headers)
{
    if(filepath == undefined )
    {
        console.log("Give filepath as first argument!! node <your reader> /path/to/file");
        return;
    }
    var csvToJson = csv({objectMode: true});
    var file = fs.createReadStream(filepath);
    var lessons = [];
    var parser = new Transform({objectMode: true});
    parser._transform = function(data, encoding, done) {
        var a = _.object(headers,data);
        console.log(a);
        done();
    };
    
    var stream = file
    .pipe(csvToJson)
    .pipe(parser)
    
    stream.on('end',function(){
        console.log(lessons);
        console.log("soiidjfsdjfiosdjfiosdjdf\n\n");
    });
}