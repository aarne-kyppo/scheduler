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
      $scope.lessonsctrl.groupNotFound = false;

      $scope.groupselected = function(){ //Triggers getLessons-function of LessonsController.
        $scope.lessonsctrl.schooldays = [];
        $scope.use_sample_data = false;
        $scope.lessonsctrl.groupNotFound = false;
        $scope.lessonsctrl.getLessons($scope.selectedgroup.name,null);
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
                  $scope.lessonsctrl.groups.push(selectedgroup);
                }
                else{
                  $scope.lessonsctrl.groups.push({
                    id: index,
                    name: group,
                  });
                  index++;
                }
              });
              //If there is no requested group, make notification for user.
              if($scope.selectedgroup)
              {
                if($scope.selectedgroup.name === undefined)
                {
                  $scope.lessonsctrl.groupNotFound = true;
                }
                else{
                  $scope.lessonsctrl.getLessons($scope.selectedgroup.name,null);
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
app.directive('intersectingLessons',function(){
  return {
    restrict: 'E',
    require: '^LessonsController',
    templateUrl: rooturl + '/angular-templates/intersectinglessons.html',
    controller: function($scope){
      $scope.getLesson = function(lessonarr){//For overlapping lessons only.
        return lessonarr.intersectinglessons[lessonarr.selectedindex];
      };
      $scope.getNextLesson = function(lessonarr){//Navigation function for overlapping lessons.
        lessonarr.selectedindex++;
        if(lessonarr.selectedindex >= (lessonarr.intersectinglessons.length))
        {
          lessonarr.selectedindex = 0;
          return lessonarr.intersectinglessons[0];
        }
        return lessonarr.intersectinglessons[lessonarr.selectedindex];
      };
      $scope.getPrevLesson = function(lessonarr){//Navigation function for overlapping lessons.
        lessonarr.selectedindex--;
        if(lessonarr.selectedindex < 0)
        {
          lessonarr.selectedindex = lessonarr.intersectinglessons.length-1;
          return _.last(lessonarr.intersectinglessons);
        }
        return lessonarr.intersectinglessons[lessonarr.selectedindex];
      };
    },
  }
});
app.directive('lesson',function(){
  return {
    restrict: 'E',
    require: '^LessonsController',
    templateUrl: rooturl + '/angular-templates/lesson.html',
  }
});
app.directive('schoolDays',function(){
  return {
    template: "<ng-include src='lessonsctrl.getTemplate()'></ng-include>",//Template is different in weekview than in dayview.

    controller: function($scope)
    {
      $(window).scroll(function() {
         if(($(window).scrollTop() + $(window).height()) > ($(document).height() - 100)) {
           if(!$scope.lessonsctrl.fetching_lessons_unfinished && $scope.lessonsctrl.schooldays.length > 0)
           {
             var group = null;
             if($scope.selectedgroup)
             {
               group = $scope.selectedgroup.name | null;
             }
             $scope.lessonsctrl.getLessons(group,moment(_.last($scope.lessonsctrl.schooldays).date).add(2,'days').format('YYYY-MM-DD'));
           }
         }
      });
    },
  };
});
app.controller('LessonsController',function($scope,$http,$location){ //This controller will be replaced by directive.
  var scope = this;
  scope.hours = [8,9,10,11,12,13,14,15,16,17,18,19,20];
  scope.schooldays = [];
  scope.groups = [];
  scope.groupNotFound = false;

  scope.rowheight = 150;
  scope.minuteheight = this.rowheight/60.0;
  scope.lessonsareaheight = this.hours.length * this.rowheight - $('.dateheader').height();
  scope.fetching_lessons_unfinished = false; //To prevent fetching same week many times.

  scope.isWeekView = false;
  scope.isDayView = true;
  $scope.use_sample_data = false;

  $scope.$watch('use_sample_data',function(){
    if($scope.use_sample_data)
    {
      scope.schooldays = [];
      scope.schooldays.length = 0;
      scope.getLessons();
    }
    else{
      scope.schooldays = [];
      scope.schooldays.length = 0;
      if($scope.selectedgroup && $scope.selectedgroup.name){
        scope.getLessons($scope.selectedgroup.name,null);
      }
    }
  });

  /*
  * Functions for insersecting lessons.
  scope.getLesson = function(lessonarr){//For overlapping lessons only.
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };
  scope.getNextLesson = function(lessonarr){//Navigation function for overlapping lessons.
    lessonarr.selectedindex++;
    if(lessonarr.selectedindex >= (lessonarr.intersectinglessons.length))
    {
      lessonarr.selectedindex = 0;
      return lessonarr.intersectinglessons[0];
    }
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };
  scope.getPrevLesson = function(lessonarr){//Navigation function for overlapping lessons.
    lessonarr.selectedindex--;
    if(lessonarr.selectedindex < 0)
    {
      lessonarr.selectedindex = lessonarr.intersectinglessons.length-1;
      return _.last(lessonarr.intersectinglessons);
    }
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };
*/

  scope.changeView = function(){
      if(scope.isWeekView){
        scope.isDayView = true;
        scope.isWeekView = false;
      }
      else{
        scope.isDayView = false;
        scope.isWeekView = true;
      }
  };

  scope.isNewWeek = function(index){
    return (parseInt(index) % 7) === 0;
  };

  scope.getTemplate = function(){
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

  scope.calculateDimensions = function(lesson){
    var start = lesson.start_time.split(":");
    var y0 = parseInt(start[1])*scope.minuteheight+(parseInt(start[0])-scope.hours[0])*scope.rowheight;
    var end = lesson.end_time.split(":");
    var y1 = parseInt(end[1])*scope.minuteheight + (parseInt(end[0])-scope.hours[0])*scope.rowheight;

    lesson.top = y0;
    lesson.height = y1-y0;
    if(lesson.lecturer instanceof Array){//For many lecturers.
      lesson.lecturer = lesson.lecturer.join(",");
    }
  };

  scope.getLessons = function(group,selected_date){
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
            var modified_data = [];
              //Generating y-position and height of lessons regarding starting- and endingtime.
              data.forEach(function(schoolday){
                  schoolday.lessons.forEach(function(lesson){
                      if(lesson.intersectinglessons)//For intersecting lessons.
                      {
                        lesson.intersectinglessons.forEach(function(intersectinglesson){
                          scope.calculateDimensions(intersectinglesson);
                        });
                      }
                      else{
                        scope.calculateDimensions(lesson);
                      }
                  });
              });
              $.merge(scope.schooldays,data);
          }
          scope.fetching_lessons_unfinished = false;
      });
  };
});
