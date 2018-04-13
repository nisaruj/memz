angular.module('qform',[]).controller('qform-control',['$scope', '$http' , function($scope, $http) {
    var getQuiz,index;
    var randquiz = function() {
        index = Math.floor(Math.random() * getQuiz.length);
        $scope.curQuiz = getQuiz[index].meaning;
        //console.log('Rand new question. : %s',getQuiz[index].meaning);
    };
    $scope.randquiz = function() {
        randquiz();
    };
    $scope.forminit = function() {
        $scope.inputclass = "form-control";
        $scope.curQuiz = 'Question?';
        console.log(getLID);
        return $http.get('/lesson/get_qset/' + getLID.toString()).then(function(response){
            getQuiz = response.data._lesson.vocab;
            //console.log(getQuiz);
            randquiz();
        });
    };
    $scope.check = function() {
        if ($scope.answer == getQuiz[index].word) {
            $scope.inputclass = "form-control is-valid";
            //console.log("Correct! The answer is %s",getQuiz[index].word);
            randquiz();
        } else {
            $scope.inputclass = "form-control is-invalid";
            //console.log("Wrong! The answer is %s",getQuiz[index].word);
        }
        $scope.answer = null;
    };
    $scope.showans = function() {
        $scope.answer = getQuiz[index].word;
    };
}]);

