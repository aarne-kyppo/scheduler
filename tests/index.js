var should = require('should');
describe('Index',function(){
    var date_str = "2015-02-23";
    var m = require('mongojs').connect('schedule',['lessons']);
    describe('#lessonsByDate',function(){
        it("Should return only one object.",function(done){
            m.lessons.find({'start_date': date_str},function(err,lessons){
                lessons.should.be.an.instanceOf(Object);
                done();
            });
        });
    })
});