var app = angular.module('scheduler',[]);
app.directive('onRenderFinished',function(){
  return {
    restrict: 'A',
    link: function(scope,elem,attr){
      if(scope.$last === true)
      {
        $('.dateheader').css('position','static');
        $('.dateheader').scrollToFixed();
      }
    }
  }
});
app.controller('LessonsController',function($http){

  var scope = this;
  this.hours = [8,9,10,11,12,13,14,15,16,17,18,19,20];
  this.lessons = [];
  this.groups = [];
  this.selectedgroup = '';
  this.rowheight = 150;
  this.minuteheight = this.rowheight/60.0;
  this.lessonsareaheight = this.hours.length * this.rowheight;
  this.fetching_lessons_unfinished = true; //To prevent fetching same week many times.

  this.groupselected = function(){
      console.log('group selected');
      scope.lessons = [];
      scope.getLessons(scope.selectedgroup,null);
  };
  this.getLessons = function(group,selected_date){
      scope.fetching_lessons_unfinished = true;
      var url = '/scheduler/lessons/json/group/' + group;
      if(selected_date)
      {
          url = url + '/' + selected_date;
      }
      $http.get(url).success(function (data,status,headers,config){
          if(status === 200)
          {
              console.log(scope);
              for(var i=0;i<data.length;i++)
              {
                  for(var j=0;j<data[i].lessons.length;j++)
                  {
                      var start = data[i].lessons[j].start_time.split(":");
                      var y0 = parseInt(start[1])*scope.minuteheight+(parseInt(start[0])-scope.hours[0])*scope.rowheight;
                      var end = data[i].lessons[j].end_time.split(":");
                      var y1 = parseInt(end[1])*scope.minuteheight + (parseInt(end[0])-scope.hours[0])*scope.rowheight;

                      data[i].lessons[j].top = y0;
                      data[i].lessons[j].height = y1-y0;
                      if(data[i].lessons[j].lecturer instanceof Array){
                        data[i].lessons[j].lecturer = data[i].lessons[j].lecturer.join(",");
                      }
                  }
              }
              $.merge(scope.lessons,data);
              console.log(scope.lessons[0].lessons[0].room);
          }
          scope.fetching_lessons_unfinished = false;
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
      $(window).scroll(function() {
         if(($(window).scrollTop() + $(window).height()) > ($(document).height() - 100)) {
             if(!scope.fetching_lessons_unfinished)
             {
                 scope.getLessons(scope.selectedgroup,moment(scope.lessons[scope.lessons.length-1].date).add(2,'days').format('YYYY-MM-DD'));
             }
         }
      });
  };
  this.initialize();
});
