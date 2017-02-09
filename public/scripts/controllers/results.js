angular.module('curatedAdsIBM')
    .controller('ResultsCtrl',function ($scope, $http){
        $scope.results;
        $scope.getDocs = function(){
            $http.get('/getdocs').then(function successCallback(response){
                $scope.results = response;
            },function errorCallback(response){
                console.log(response);
            });
        };
    });