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
function prepareLessonsArray(date){
  //If date not provided, current date is used. Date is provided when user wants to see lessons from another week
  start_date = moment(date) || moment();
  var monday = moment(start_date).subtract(start_date.day()-1,'days'); //In this application week starts from monday.
  var nextmonday = moment(monday).add(1,'w');
  var lessonsarray = [];

  for(var i=0;i<=6;i++)
  {
      var currentdate = moment(monday).add(i,'days');
      var weekday = currentdate.format('ddd');
      var dateheader = {
          date: currentdate.format('YYYY-MM-DD'),
          finnishdate: currentdate.format('D.M'),
          weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
          weeknumber: currentdate.format('W'),
          lessons: []
      };
      lessonsarray.push(dateheader);
  }
  return lessonsarray;
}
function doLessonsIntersect(lessona, lessonb){
  var a = Array.isArray(lessona) ? lessona[0] : lessona;
  var b = Array.isArray(lessonb) ? lessonb[0] : lessonb;
  var a_start = moment(a.start_date + " " + a.start_time, 'YYYY-MM-DD HH:mm');
  var a_end = moment(a.start_date + " " + a.end_time, 'YYYY-MM-DD HH:mm');
  var b_start = moment(b.start_date + " " + b.start_time, 'YYYY-MM-DD HH:mm');
  var b_end = moment(b.start_date + " " + b.end_time, 'YYYY-MM-DD HH:mm');
  if(a_start.isBetween(b_start,b_end))
  {
    return true;
  }
  if(b_start.isBetween(a_start,a_end))
  {
    return true;
  }
  return false;
}

function joinIntersectingLessons(lessonsarray){
  //Too complex(I know). Comparison should be made when data is pushed into database.
  var schoolday;
  var h,i,j;
  for(h=0;h<lessonsarray.length;h++){
    schoolday = lessonsarray[h];
    if(schoolday.lessons.length > 1)
    {
      var lessona, lessonb;
      var lessons = schoolday.lessons;
      for(i=0;i<lessons.length;i++)
      {
        lessona = lessons[i];
        for(j=i+1;j<lessons.length;j++){
          lessonb = lessons[j];
          if(doLessonsIntersect(lessona,lessonb)){
            var overlappinglesson = lessons.splice(j,1)[0];
            if(Array.isArray(lessona))
            {
              lessona.intersectinglessons.push(overlappinglesson);
            }
            else{
              console.log("lolololo");
              lessons[i] = {
                selectedindex: 0,
                intersectinglessons: [lessona,overlappinglesson]
              };
            }
            console.log("Found intersecting lessons");
            console.log(schoolday.lessons);
          }
        }
      }
    }
  }
  return lessonsarray;
}
/*
For test data to show sample data on application.
*/
router.get('/lessons/json/sampledata/:date?',function(req,res,next){
    var lessonsarray = prepareLessonsArray(req.params.date);
    console.log(lessonsarray);

    //Generating sample lessons
    var samplelesson1 = {
      title: 'Testitunti',
      start_time: '08:15',
      start_date: '2015-08-10',
      end_time: '12:30',
      lecturer: ['Ossi Opettaja'],
      room: 'A111',

    };
    var samplelesson2 = _.clone(samplelesson1);
    samplelesson2.start_time = '13:00';
    samplelesson2.end_time = '16:10';

    var samplelesson3 = _.clone(samplelesson1);
    samplelesson3.start_time = '14:00';
    samplelesson3.end_time = '16:00';

    var samplelesson4 = _.clone(samplelesson1);

    samplelesson4.start_time = '13:00';
    samplelesson4.end_time = '16:10';
    samplelesson4.start_date = '2015-08-12';


    lessonsarray[0].lessons.push(samplelesson1);
    lessonsarray[0].lessons.push(samplelesson2);
    lessonsarray[0].lessons.push(samplelesson3);
    lessonsarray[2].lessons.push(samplelesson4);

    res.json(joinIntersectingLessons(lessonsarray));
});
router.get('/lessons/json/group/:group/:date*?',function(req,res,next){
  var lessonsarray = prepareLessonsArray(req.params.date);

  mongo.lessons.find({start_date: { $gte: monday.format('YYYY-MM-DD'), $lt: nextmonday.format('YYYY-MM-DD') }, groups: req.params.group},function(err,lessons){
      for(var i=0; i<lessons.length;i++){
           var day_of_lesson = _.find(lessonsarray,function(obj){ return obj.date === lessons[i].start_date;});
           if(day_of_lesson)
           {
               day_of_lesson.lessons.push(lessons[i]);
           }
      }
      lessonsarray = joinIntersectingLessons(lessonsarray);
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
