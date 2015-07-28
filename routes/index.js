var express = require('express');
var _ = require('underscore');
var moment = require('moment');
var mongo = require('mongojs').connect('schedule',['lessons',]);
var router = express.Router();
moment.locale('fi');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index',{title: 'Scheduler',rooturl: req.app.locals.rooturl});
});
router.get('/lessons/group/:group', function(req, res, next) {
    res.render('index',{title: 'Scheduler', rooturl: req.app.locals.rooturl});
});
router.post('/options/group/',function(req,res,next){
    res.redirect(req.app.locals.rooturl + '/lessons/group/' + req.body.group);
});
/*
For test data to show sample data on application.
*/
router.get('/lessons/json/sampledata/:date?',function(req,res,next){
    start_date = moment(req.params.date) || moment();

    var monday = moment(start_date).subtract(start_date.day()-1,'days'); //In this application week starts from monday.
    var nextmonday = moment(monday).add(1,'w');

    var lessonsarray = [];

    for(var i=0;i<=6;i++)
    {
        var currentdate = moment(monday).add(i,'days');
        var weekday = currentdate.format('ddd');

        var dateheader = {
            date: currentdate.format('YYYY-MM-DD'),
            finnishdate: currentdate.format('L'),
            weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
            lessons: []
        };
        lessonsarray.push(dateheader);
    }

    //Generating sample lessons
    var samplelesson1 = {
      title: 'Testitunti',
      start_time: '08:15',
      end_time: '12:30',
      lecturer: ['Ossi Opettaja'],
      room: 'A111',

    };
    var samplelesson2 = _.clone(samplelesson1);
    samplelesson2.start_time = '14:00';
    samplelesson2.end_time = '16:10';

    lessonsarray[0].lessons.push(samplelesson1);
    lessonsarray[0].lessons.push(samplelesson2);
    lessonsarray[2].lessons.push(samplelesson1);

    res.json(lessonsarray);
});
router.get('/lessons/json/group/:group/:date*?',function(req,res,next){
    console.log(req.params.group);
    start_date = moment(req.params.date) || moment(); //If date not provided, current date is used. Date is provided when user wants to see lessons from another week
    console.log('start_date = ' + start_date.format('L'));
    var monday = moment(start_date).subtract(start_date.day()-1,'days'); //In this application week starts from monday.
    var nextmonday = moment(monday).add(1,'w');
    console.log('monday = ' + monday.format('L') + ' next monday = ' + nextmonday.format('L'));
    var lessonsarray = []; //To decrease calculations in frontend. Filled inside mongodb query callback.

    for(var i=0;i<=6;i++)
    {
        var currentdate = moment(monday).add(i,'days');
        var weekday = currentdate.format('ddd');
        var dateheader = {
            date: currentdate.format('YYYY-MM-DD'),
            finnishdate: currentdate.format('L'),
            weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
            lessons: []
        };
        lessonsarray.push(dateheader);
    }
    console.log(lessonsarray);
    mongo.lessons.find({start_date: { $gte: monday.format('YYYY-MM-DD'), $lt: nextmonday.format('YYYY-MM-DD') }, groups: req.params.group},function(err,lessons){
        for(var i=0; i<lessons.length;i++){
             var day_of_lesson = _.find(lessonsarray,function(obj){ return obj.date === lessons[i].start_date})
             if(day_of_lesson)
             {
                 day_of_lesson.lessons.push(lessons[i]);
             }
        }
        res.json(lessonsarray);
    });
});
/*
 Fetching groups for select component.
*/
router.get('/groups',function(req,res,next){
    mongo.lessons.distinct('groups',function(err,groups){
        if(!err)
        {
            res.json(_.without(groups,''));//Removing empty groups if any.
        }
        else{
            res.json([]);
        }
    });
});
module.exports = router;
