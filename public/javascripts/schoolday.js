var app = angular.module('scheduler',['ngRoute']);

app.config(['$routeProvider',function($routeProvider){
  $routeProvider.when('/test',{

  })
}]);

app.directive('onRenderFinished',function(){ //Directive to ensure right rendering of dateheaders
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

/*
* Directive to populate group input.
*/
app.directive('groups',function($compile){
  return {
    restrict: 'E',
    link: function(scope,elem,attrs,schoolDays){
      scope.schoolDays = schoolDays;
    },
    controller: function($scope,$http)
    {

      $scope.groupselected = function(){ //Triggers getLessons-function of LessonsController.
        $scope.lessons.lessons = [];
        console.log('groups:groupselected');
        $scope.use_sample_data = false;
        $scope.lessons.getLessons($scope.lessons.selectedgroup,null);
      };

      this.initialize = function(){
        $http.get(rooturl + '/groups').success(function(data,status,headers,config){
            if(status === 200)
            {
                $scope.lessons.groups = data;
                $scope.lessons.selectedgroup = data[0];
                console.log($scope.lessons.selectedgroup);
            }
        });
      }
      this.initialize();
    },
    templateUrl: rooturl + '/angular-templates/groups.html',
  };
});
app.directive('schoolDays',function($compile){
  return {
    template: "<ng-include src='getTemplate()'></ng-include>",

    controller: function($scope)
    {
      $(window).scroll(function() {
         if(($(window).scrollTop() + $(window).height()) > ($(document).height() - 100)) {
           console.log($scope.lessons.lessons.length);
           if(!$scope.fetching_lessons_unfinished && $scope.lessons.lessons.length > 0)
           {
               $scope.lessons.getLessons($scope.selectedgroup,moment($scope.lessons.lessons[$scope.lessons.lessons.length-1].date).add(2,'days').format('YYYY-MM-DD'));
           }
         }
      });
    },
  }
});
app.controller('LessonsController',function($scope,$http){ //This controller will be replaced by directive.

  var scope = this;
  this.hours = [8,9,10,11,12,13,14,15,16,17,18,19,20];
  this.lessons = [];
  this.groups = [];
  this.selectedgroup = '';
  this.rowheight = 150;
  this.minuteheight = this.rowheight/60.0;
  this.lessonsareaheight = this.hours.length * this.rowheight - $('.dateheader').height();
  this.fetching_lessons_unfinished = true; //To prevent fetching same week many times.
  var that = this;
  that.isWeekView = false;
  that.isDayView = true;
  $scope.use_sample_data = false;

  $scope.$watch('use_sample_data',function(){
    if($scope.use_sample_data)
    {
      scope.lessons = [];
      scope.lessons.length = 0;
      scope.getLessons();
    }
  });
  this.changeView = function(){
      if(that.isWeekView){
        that.isDayView = true;
        that.isWeekView = false;
      }
      else{
        that.isDayView = false;
        that.isWeekView = true;
      }
  }

  $scope.isNewWeek = function(index){
    return (parseInt(index) % 7) == 0;
  }

  $scope.getTemplate = function(){
    var rootURL = rooturl + '/angular-templates/';
    var templates = {
      week: rootURL + 'weekview.html',
      day: rootURL + 'dayview.html'
    }
    if(that.isDayView)
    {
      return templates.day;
    }
    return templates.week;
  }

  this.getLessons = function(group,selected_date){
      scope.fetching_lessons_unfinished = true;
      var url = "";
      if($scope.use_sample_data)
      {
        url = (selected_date) ? rooturl + '/lessons/json/sampledata/' + selected_date : rooturl + '/lessons/json/sampledata';
      }
      else{
        url = rooturl + '/lessons/json/group/' + group;
        if(selected_date)
        {
          url = url + '/' + selected_date;
        }
      }
      $http.get(url).success(function (data,status,headers,config){
          if(status === 200)
          {
              //Generating y-position and height of lessons regarding starting- and endingtime.
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
                      if(data[i].lessons[j].lecturer instanceof Array){//For many lecturers.
                        data[i].lessons[j].lecturer = data[i].lessons[j].lecturer.join(",");
                      }
                  }
              }
              $.merge(scope.lessons,data);
              console.log(scope.lessons[0].lessons[0]);
          }
          scope.fetching_lessons_unfinished = false;
      });
  };
});
