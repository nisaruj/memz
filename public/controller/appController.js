var app = angular.module('qform', ['ngRoute']);

var review_stat = {};

app.config(function($routeProvider) {
    $routeProvider
    .when("/result", {
      templateUrl : "/controller/appView/review_result.htm",
      controller: 'result-control'
    })
    .otherwise({
      templateUrl : "/controller/appView/review_main.htm",
      controller: 'qform-control'
    })
  });

app.controller('qform-control', ['$scope', '$http', '$location', function($scope, $http, $location) {
    var getQuiz, index, score, quizCount, maxQuizCount, correct_id = [], quiz_id = new Set(), isShowAnswer = false;

    var disableInput = function(is_disable) {
        $scope.disableAnswer = is_disable;
        $scope.disableSubmit = is_disable;
        $scope.showbtn = is_disable ? 'showskip-disable' : 'showskip';
        $scope.skipbtn = is_disable ? 'showskip-disable' : 'showskip';
    }

    var randquiz = function() {
        console.log(score.toString() + '/' + quizCount.toString());
        if (quizCount >= getQuiz.length || quizCount >= maxQuizCount) {
            $scope.curQuiz = "Loading result ...";
            disableInput(true);
            var data = {
                lid: getLID,
                id: correct_id,
                qid: Array.from(quiz_id),
                vsize: getQuiz.length
            }
            $http.post('/lesson/'+getLID.toString()+'/review/', data).then(function(msg){
                $location.path('result');
                //console.log(msg.data);
                review_stat = msg.data;
            });
            return 0;
        }
        do {
            index = Math.floor(Math.random() * getQuiz.length);
        } while(quiz_id.has(index+1));
        $scope.curQuiz = getQuiz[index].meaning;
        quiz_id.add(index+1);
        isShowAnswer = false;
        quizCount++;
        //console.log('Rand new question. : %s',getQuiz[index].meaning);
    };

    $scope.skip = function() {
        $scope.cardclass = 'card-body-wrong w-50';
        randquiz();
    };

    $scope.forminit = function() {
        $scope.lesson_name = getLessonName;
        $scope.lesson_course = getLessonCourse;
        $scope.cardclass = 'card-body-init w-50';
        $scope.curQuiz = 'Loading question ...';
        disableInput(true);
        return $http.get('/lesson/get_qset/' + getLID.toString()).then(function(response){
            getQuiz = response.data._lesson.vocab;
            score = 0;
            quizCount = 0;
            maxQuizCount = 10; // Default wordcount per review
            randquiz();
            disableInput(false);
        });
    };

    $scope.check = function() {
        if (!isShowAnswer && $scope.answer == getQuiz[index].word) {
            $scope.cardclass = 'card-body-correct w-50';
            correct_id.push(index+1);
            score++;
        } else {
            $scope.cardclass = 'card-body-wrong w-50';
            //console.log("Wrong! The answer is %s",getQuiz[index].word);
        }
        $scope.answer = null;
        randquiz();
    };

    $scope.showans = function() {
        isShowAnswer = true;
        $scope.cardclass = 'card-body-wrong w-50';
        $scope.answer = getQuiz[index].word;
    };
}]);

app.controller('result-control', ['$scope', function($scope){
    console.log(review_stat._stat);
    console.log(review_stat._overall);
    $scope.Math = window.Math;
    $scope._stat = review_stat._stat;
    $scope._vocab = review_stat._lesson.vocab;
    $scope._overall = review_stat._overall;
    $scope.notLoggedIn = !isLoggedIn;
}]);

