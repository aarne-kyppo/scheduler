var express = require('express');
var _ = require('underscore');
var mongo = require('mongojs').connect('schedule',['lessons',]);
var router = express.Router();

router.use(function(req,res,next){
    //Getting groups
    mongo.lessons.distinct('groups',function(err,groups){
        if(!err)
        {
            req.groups = _.without(groups,'');
            next();
        }
        else{
            req.groups = [];
            next();
        }
    });
});

router.param('group',function(req,res,next,group){
    req.group = group;
    next();
});


/* GET home page. */
router.get('/', function(req, res, next) {
    var hours = _.range(8,21);
    console.log(req.cookies.group);
    res.render('index',{hours: hours, title: 'Scheduler', groups: req.groups});
});
router.post('/options/group/:group',function(req,res,next){
    if(req.body.group)
    {
        req.cookies.group = req.group;
    }
    res.redirect('/');
});

router.get('/lessons/test',function(req,res,next){
    console.log(req.group);
    mongo.lessons.find({start_date: '2015-05-11'},function(err,lessons){
        res.json(lessons);
    });
});
router.get('/lessons/group/:group',function(req,res,next){
    console.log(req.group);
    mongo.lessons.find({start_date: '2015-05-11', groups: req.group},function(err,lessons){
        res.json(lessons);
    });
});

module.exports = router;
