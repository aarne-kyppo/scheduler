var express = require('express');
var _ = require('underscore');
var moment = require('moment');
var mongo = require('mongojs').connect('schedule',['lessons',]);
var router = express.Router();
moment.locale('fi');

router.param('group',function(req,res,next,group){
    req.group = group;
    next();
});
router.param('date',function(req,res,next,date){
    req.date = date;
    next();
});
/* GET home page. */
router.get('/', function(req, res, next) {
    var hours = _.range(8,21);
    res.render('index',{title: 'Scheduler',rooturl: req.app.locals.rooturl});
});
router.get('/lessons/group/:group', function(req, res, next) {
    var hours = _.range(8,21);
    res.render('index',{title: 'Scheduler', rooturl: req.app.locals.rooturl});
});
router.post('/options/group/',function(req,res,next){
    res.redirect(req.app.locals.rooturl + '/lessons/group/' + req.body.group);
});

router.get('/lessons/test',function(req,res,next){
    console.log(req.group);
    mongo.lessons.find({start_date: '2015-05-11'},function(err,lessons){
        res.json(lessons);
    });
});
router.get('/lessons/json/group/:group/:date*?',function(req,res,next){
    console.log(req.group);
    start_date = req.date || moment().format('YYYY-MM-DD');//If date not provided, current date is used
    mongo.lessons.find({start_date: start_date, groups: req.group},function(err,lessons){
        res.json(lessons);
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
