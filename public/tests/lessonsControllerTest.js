describe("Testing LessonsController",function(){
  beforeEach(function(){
    angular.module('ngRoute',[]);
    module('scheduler');
  });
  var $scope;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));
  //Overlapping is measured from generated top and height value(not explicitely from time value, but implicitely).
  describe('Overlapping lessons should be notified',function(){
    var lessonscontroller;

    var lessona = {
      top: 0,
      height: 200,
    };
    var lessonb = {
      top: 100,
      height: 200,
    };
    var lessonc = {
      top: 250,
      height: 200,
    };
    var lessond = {
      top: 500,
      height: 400,
    };
    var lessonf = {
      top: 600,
      height: 200,
    };
    var lessong = {
      top: 800,
      height: 200,
    };

    beforeEach(inject(function($location,$http,$rootScope){
      $scope = $rootScope.$new();
      lessonscontroller = $controller('LessonsController',{$scope: $scope});
    }));

    it('First lesson starts before second lesson and ends during second lesson',function(){
      expect($scope.doLessonsIntersect(lessona,lessonb)).toEqual(true);
    });

    it('First lesson starts during second lesson and ends after second lesson',function(){
      expect($scope.doLessonsIntersect(lessonc,lessonb)).toEqual(true);
    });

    it('First lesson starts and ends during second lesson',function(){
      expect($scope.doLessonsIntersect(lessond,lessonf)).toEqual(true);
    });

    it('Second lesson starts and ends during first lesson',function(){
      expect($scope.doLessonsIntersect(lessonf,lessond)).toEqual(true);
    });

    it('Lessons dont intersect',function(){
      expect($scope.doLessonsIntersect(lessona,lessond)).toEqual(false);
      expect($scope.doLessonsIntersect(lessond,lessona)).toEqual(false);
      expect($scope.doLessonsIntersect(lessonf,lessong)).toEqual(false);
      expect($scope.doLessonsIntersect(lessong,lessonf)).toEqual(false);
    });
  });
});
