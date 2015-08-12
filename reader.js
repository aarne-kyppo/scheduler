var fs = require('fs');
var through = require('through');
var _ = require('underscore');
var Transform = require('stream').Transform
  , csv = require('csv-streamify');
module.exports = function(filepath, headers,dbname,collections,test)
{
    var m = require('mongojs').connect('schedule',collections);
    console.log("collections" + collections);
    if(filepath == undefined )
    {
        console.log("Give filepath as first argument!! node <your reader> /path/to/file");
        return;
    }
    console.log(typeof m.lessons);
    var csvToJson = csv({objectMode: true});
    var file = fs.createReadStream(filepath);
    var lessons = [];
    var date_regexp = /\d{4}[-]\d{2}[-]\d{2}/g;
    var parser = new Transform({objectMode: true});
    parser._transform = function(data, encoding, done) {
        if(date_regexp.test(data[0]))//Ensuring that headers will not be placed into database
        {
            for(var i=0;i<data.length;i++)
            {
                data[i] = data[i].trim();
                if(headers[i] === 'groups' || headers[i] === 'lecturer')
                {
                    data[i] = data[i].split(", ");
                }
            }
            var lesson = _.object(headers,data);
            if('groups' in lesson)
            {
                console.log(lesson.groups);
            }
            lessons.push(lesson);
            //console.log(lesson);
            done();
        }
        else{
            console.log("Data is not in right form");
            done();
        }
    };

    var stream = file
    .pipe(csvToJson)
    .pipe(parser);

    stream.on('finish',function(){
        if(test)
        {
            m.lessonstest.insert(lessons, function(err, s){
                console.log("Writing test data ended");
                return;
            });
        }
        else{
            m.lessons.insert(lessons, function(err, s){
                console.log("Writing data finished");
                return;
            });
        }
    });
};
