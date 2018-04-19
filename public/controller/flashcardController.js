var app = angular.module('flashcard', []);

app.controller('flashcard-control', ['$scope', '$http', function($scope, $http){
    var getQuiz, curIndex = 0;

    var getWord = function() {
        $scope.curWord = getQuiz[curIndex].word;
        $scope.curMeaning = getQuiz[curIndex].meaning;
    }

    var init = function() {
        $scope.lesson_name = getLessonName;
        $scope.lesson_course = getLessonCourse;
        $scope.curWord = 'Loading question ...';
        $scope.getLID = getLID
        return $http.get('/lesson/get_qset/' + getLID.toString()).then(function(response){
            getQuiz = response.data._lesson.vocab;
            console.log(getQuiz);
            getWord();
        });
    };

    $scope.nextWord = function() {
        //console.log('next word');
        curIndex = Math.min(curIndex+1,getQuiz.length-1);
        getWord();
    }

    $scope.prevWord = function() {
        //console.log('next word');
        curIndex = Math.max(curIndex-1,0);
        getWord();
    }

    init();
}]);
