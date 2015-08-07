var app = angular.module('scheduler',['ngRoute']);

app.config(function($locationProvider){
  $locationProvider.html5Mode(true).hashPrefix("");
});
app.run(function($rootScope,$location){
  var params = $location.search();
  if(params.group)
  {
    $rootScope.selectedgroup = params.group;
  }
});

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
  };
});

/*
* Directive to populate group input.
*/
app.directive('groups',function($compile){
  return {
    restrict: 'E',

    controller: function($scope,$http)
    {
      $scope.groupNotFound = false;

      $scope.groupselected = function(){ //Triggers getLessons-function of LessonsController.
        $scope.lessons.lessons = [];
        $scope.use_sample_data = false;
        $scope.groupNotFound = false;
        $scope.getLessons($scope.selectedgroup.name,null);
      };
      this.initialize = function(){
        $http.get(rooturl + '/groups').success(function(data,status,headers,config){
            if(status === 200)
            {
              //What a hack to get initial selection to work.
              var index = 1;
              angular.forEach(data, function(group){
                if($scope.selectedgroup == group)
                {
                  var selectedgroup = {
                    id: 0,
                    name: group,
                  };
                  $scope.selectedgroup = selectedgroup;
                  $scope.lessons.groups.push(selectedgroup);
                }
                else{
                  $scope.lessons.groups.push({
                    id: index,
                    name: group,
                  });
                  index++;
                }
              });
              //If there is no requested group, make notification for user.
              console.log($scope.selectedgroup.name);
              if($scope.selectedgroup)
              {
                if($scope.selectedgroup.name === undefined)
                {
                  $scope.groupNotFound = true;
                }
                else{
                  console.log("lalalalala");
                  $scope.getLessons($scope.selectedgroup.name,null);
                }
              }
            }
        });
      };
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
           if(!$scope.fetching_lessons_unfinished && $scope.lessons.lessons.length > 0)
           {
             console.log('jotain');
             $scope.getLessons($scope.selectedgroup.name,moment(_.last($scope.lessons.lessons).date).add(2,'days').format('YYYY-MM-DD'));
           }
         }
      });
    },
  };
});
app.controller('LessonsController',function($scope,$http,$location){ //This controller will be replaced by directive.
  var scope = this;
  this.hours = [8,9,10,11,12,13,14,15,16,17,18,19,20];
  scope.lessons = [];
  scope.groups = [];
  scope.selectedgrp = '504T12';
  scope.groupNotFound = false;

  this.rowheight = 150;
  this.minuteheight = this.rowheight/60.0;
  this.lessonsareaheight = this.hours.length * this.rowheight - $('.dateheader').height();
  $scope.fetching_lessons_unfinished = false; //To prevent fetching same week many times.

  scope.isWeekView = false;
  scope.isDayView = true;
  $scope.use_sample_data = false;

  $scope.$watch('use_sample_data',function(){
    if($scope.use_sample_data)
    {
      scope.lessons = [];
      scope.lessons.length = 0;
      $scope.getLessons();
    }
    else{
      scope.lessons = [];
      scope.lessons.length = 0;
      if($scope.selectedgroup.name){
        $scope.getLessons($scope.selectedgroup.name,null);
      }
    }
  });

  this.changeView = function(){
      if(scope.isWeekView){
        scope.isDayView = true;
        scope.isWeekView = false;
      }
      else{
        scope.isDayView = false;
        scope.isWeekView = true;
      }
  };

  $scope.isNewWeek = function(index){
    return (parseInt(index) % 7) === 0;
  };

  $scope.getTemplate = function(){
    var rootURL = rooturl + '/angular-templates/';
    var templates = {
      week: rootURL + 'weekview.html',
      day: rootURL + 'dayview.html'
    };
    if(scope.isDayView)
    {
      return templates.day;
    }
    return templates.week;
  };

  $scope.getLessons = function(group,selected_date){
      $scope.fetching_lessons_unfinished = true;
      console.log("asoijdaiosjdasioj");
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
          }
          $scope.fetching_lessons_unfinished = false;
      });
  };
});
