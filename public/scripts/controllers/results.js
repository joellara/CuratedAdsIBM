angular.module('curatedAdsIBM')
    .controller('ResultsCtrl',function ($scope, $http){
        $scope.maleCount = 0;
        $scope.femaleCount = 0;
        $scope.ages = [];
        $scope.getDocs = function(){
            $http.get('/getdocs').then(function successCallback(response){
                JSON.parse(response.data.data).forEach(function(value){
                    var doc = value.doc;
                    $scope.ages.push(doc.age);
                    if(doc.gender === "FEMALE"){
                        $scope.femaleCount++;
                    }else{
                        $scope.maleCount++;
                    }
                });
            },function errorCallback(response){
                console.log(response);
            });
        };
    });