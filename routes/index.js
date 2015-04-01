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
    res.render('index',{hours: hours, title: 'Scheduler', groups: req.groups, selectedgroup: undefined, rooturl: req.app.locals.rooturl});
});
router.get('/lessons/group/:group', function(req, res, next) {
    var hours = _.range(8,21);
    res.render('index',{hours: hours, title: 'Scheduler', groups: req.groups, selectedgroup: req.group, rooturl: req.app.locals.rooturl});
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
router.get('/lessons/json/group/:group',function(req,res,next){
    console.log(req.group);
    mongo.lessons.find({start_date: '2015-05-11', groups: req.group},function(err,lessons){
        res.json(lessons);
    });
});

module.exports = router;
