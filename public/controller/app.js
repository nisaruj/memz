angular.module('query', []).service('getQuizset', function($http){
    return {
        quizset: function(lid){
            return $http.get('/lesson/get_qset/' + lid.toString());
        }
    }
});