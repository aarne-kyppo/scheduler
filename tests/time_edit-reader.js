var should = require('should');
var _ = require('underscore');
var reader = require('../time_edit-reader');

describe('Time-edit reader',function(){
    var headers = [
    'start_date',
    'start_time',
    'end_date',
    'end_time',
    'p1',
    'p2',
    'room',
    'title',
    'groups',
    'lecturer',
    'info'
    ];
    var collections = ["lessonstest",];
    var mongo = require('mongojs').connect('schedule',collections);
    
    var testdatafile = "./testcsv.txt";
    
    afterEach(function(done){
        done();
        mongo.lessonstest.remove({},done);
    })
    
    describe('#read',function(){
        it('Should match expected data.',function(done){
            reader.callreader(collections,testdatafile);
            var expected_data = [
                '2015-02-02',
                '08:15',
                '2015-02-02',
                '11:45',
                '',
                '',
                'A321 Ciscolabra, Rovaniemi Rantavitikka',
                'Laboratorioharjoitukset, Server Environments',
                ['504D12', 'Exchange Students IT',],
                ['Kesti Aku',],
                '', 
            ];
            mongo.should.not.equal(undefined);
            mongo.lessonstest.find({},function(err,result){
                if(!err)
                {
                    result.length.should.equal(1);
                    [1,2,3].should.be.eql([1,2,3]);
                    var lesson = result[0];
                    for(var i=0;i<headers.length;i++)
                    {
                        lesson[headers[i]].should.be.eql(expected_data[i]);
                    }
                    
                }
                done();
            });
        });
    });
});