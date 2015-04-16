var app = angular.module('scheduler',[]);
app.controller('LessonsController',function($http){
    var scope = this;
    this.hours = [8,9,10,11,12,13,14,15,16,17,18,19,20];
    this.lessons = [];
    this.groups = [];
    this.selectedgroup = '';
    this.rowheight = 150;
    $('.tthour').height(this.rowheight + 'px');
    this.minuteheight = this.rowheight/60.0;
    this.lessonsareaheight = this.hours.length * this.rowheight;
    $('.lessonsarea').height(this.lessonsareaheight);
    
    this.groupselected = function(){
        console.log('group selected');
        scope.getLessons(scope.selectedgroup);
    };
    this.getLessons = function(group){
        $http.get('/scheduler/lessons/json/group/' + group).success(function (data,status,headers,config){
            if(status === 200)
            {
                console.log(scope);
                data.map(function(lesson){
                    var start = lesson.start_time.split(":");
                    var y0 = parseInt(start[1])*scope.minuteheight+(parseInt(start[0])-scope.hours[0])*scope.rowheight;
                    console.log(' scope.rowheight ' + scope.rowheight);
                    console.log(' scope.minuteheight ' + scope.minuteheight);
                    console.log(' start0 ' + parseInt(start[0]));
                    console.log(' scope.hours[0] ' + scope.hours[0])
                    console.log(' y0 ' + y0)
                    var end = lesson.end_time.split(":");
                    var y1 = parseInt(end[1])*scope.minuteheight + (parseInt(end[0])-scope.hours[0])*scope.rowheight;
                    
                    lesson.top = y0;
                    lesson.height = y1-y0;
                    return lesson;
                });
                scope.lessons = data;
            }
        });
    };
    this.calculate_vertical_positions = function(start_time, end_time){
        
        return  {y0: y0, y1: y1};
    };
    
    //Getting all groups to select input.
    this.initialize = function(){
        $http.get('/scheduler/groups').success(function(data,status,headers,config){
            if(status === 200)
            {
                scope.groups = data;
                scope.selectedgroup = data[0];
                console.log(data[0]);
            }
        });
    };
    this.initialize();
});