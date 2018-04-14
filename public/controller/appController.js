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
    var getQuiz, index, score, quizCount, maxQuizCount, correct_id = [], quiz_id = new Set();

    var disableInput = function(is_disable) {
        $scope.disableAnswer = is_disable;
        $scope.disableSubmit = is_disable;
        $scope.disableShow = is_disable;
        $scope.disableSkip = is_disable;
    }

    var randquiz = function() {
        console.log(score.toString() + '/' + quizCount.toString());
        if (quizCount >= maxQuizCount) {
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
        quizCount++;
        //console.log('Rand new question. : %s',getQuiz[index].meaning);
    };

    $scope.skip = function() {
        $scope.inputclass = "form-control is-invalid";
        randquiz();
    };

    $scope.forminit = function() {
        $scope.inputclass = "form-control";
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
        if ($scope.answer == getQuiz[index].word) {
            $scope.inputclass = "form-control is-valid";
            correct_id.push(index+1);
            score++;
        } else {
            $scope.inputclass = "form-control is-invalid";
            //console.log("Wrong! The answer is %s",getQuiz[index].word);
        }
        $scope.answer = null;
        randquiz();
    };

    $scope.showans = function() {
        $scope.inputclass = "form-control is-invalid";
        $scope.answer = getQuiz[index].word;
    };
}]);

app.controller('result-control', ['$scope', function($scope){
    console.log(review_stat._stat);
    $scope._stat = review_stat._stat;
    $scope._vocab = review_stat._lesson.vocab;
    $scope._overall = review_stat._overall;
}]);

