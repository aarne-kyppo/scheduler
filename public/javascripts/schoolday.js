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
              if($scope.selectedgroup)
              {
                if($scope.selectedgroup.name === undefined)
                {
                  $scope.groupNotFound = true;
                }
                else{
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
             var group = null;
             if($scope.selectedgroup)
             {
               group = $scope.selectedgroup.name | null;
             }
             $scope.getLessons(group,moment(_.last($scope.lessons.lessons).date).add(2,'days').format('YYYY-MM-DD'));
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
  scope.groupNotFound = false;

  this.rowheight = 150;
  this.minuteheight = this.rowheight/60.0;
  this.lessonsareaheight = this.hours.length * this.rowheight - $('.dateheader').height();
  $scope.fetching_lessons_unfinished = false; //To prevent fetching same week many times.

  scope.isWeekView = false;
  scope.isDayView = true;
  $scope.use_sample_data = false;
  $scope.lessonindex = 1;//for overlapping lessons.

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
      if($scope.selectedgroup && $scope.selectedgroup.name){
        $scope.getLessons($scope.selectedgroup.name,null);
      }
    }
  });

  $scope.doLessonsIntersect = function(lessona, lessonb){
    var a = Array.isArray(lessona) ? lessona[0] : lessona;
    var b = Array.isArray(lessonb) ? lessonb[0] : lessonb;
    if(a.top < b.top && (a.top+a.height) > b.top)
    {
      return true;
    }
    if(a.top < (b.top+b.height) && (a.top+a.height) > (b.top+b.height))
    {
      return true;
    }
    if(a.top < b.top && (a.top+a.height) > (b.top+b.height))
    {
      return true;
    }
    if(b.top < a.top && (b.top+b.height) > (a.top+a.height))
    {
      return true;
    }
    return false;
  };

  $scope.getLesson = function(lessonarr){//For overlapping lessons only.
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };
  $scope.getNextLesson = function(lessonarr){
    lessonarr.selectedindex++;
    if(lessonarr.selectedindex >= (lessonarr.intersectinglessons.length))
    {
      lessonarr.selectedindex = 0;
      return lessonarr.intersectinglessons[0];
    }
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };
  $scope.getPrevLesson = function(lessonarr){
    lessonarr.selectedindex--;
    if(lessonarr.selectedindex < 0)
    {
      lessonarr.selectedindex = lessonarr.intersectinglessons.length-1;
      return _.last(lessonarr.intersectinglessons);
    }
    return lessonarr.intersectinglessons[lessonarr.selectedindex];
  };


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
            var modified_data = [];
              //Generating y-position and height of lessons regarding starting- and endingtime.
              for(var i=0;i<data.length;i++)
              {
                  for(var j=0;j<data[i].lessons.length;j++)
                  {
                      var lesson = data[i].lessons[j];
                      if(lesson.intersectinglessons)
                      {
                        lesson.intersectinglessons.forEach(function(l){
                          var start = l.start_time.split(":");
                          var y0 = parseInt(start[1])*scope.minuteheight+(parseInt(start[0])-scope.hours[0])*scope.rowheight;
                          var end = l.end_time.split(":");
                          var y1 = parseInt(end[1])*scope.minuteheight + (parseInt(end[0])-scope.hours[0])*scope.rowheight;

                          l.top = y0;
                          l.height = y1-y0;
                          if(l.lecturer instanceof Array){//For many lecturers.
                            l.lecturer = l.lecturer.join(",");
                          }
                        });
                      }
                      else{
                        var start = lesson.start_time.split(":");
                        var y0 = parseInt(start[1])*scope.minuteheight+(parseInt(start[0])-scope.hours[0])*scope.rowheight;
                        var end = lesson.end_time.split(":");
                        var y1 = parseInt(end[1])*scope.minuteheight + (parseInt(end[0])-scope.hours[0])*scope.rowheight;

                        lesson.top = y0;
                        lesson.height = y1-y0;
                        if(lesson.lecturer instanceof Array){//For many lecturers.
                          lesson.lecturer = lesson.lecturer.join(",");
                        }
                      }
                  }
              }
              console.log(data);
              $.merge(scope.lessons,data);
          }
          $scope.fetching_lessons_unfinished = false;
      });
  };
});
