var express = require('express');
var _ = require('underscore');
var mongo = require('mongojs').connect('schedule',['lessons',]);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var hours = _.range(8,21);
    res.render('index',{hours: hours, title: 'Scheduler'});
});

router.get('/lessons/test',function(req,res,next){
    mongo.lessons.find({start_date: '2015-05-11'},function(err,lessons){
        res.json(lessons);
    });
});
module.exports = router;
