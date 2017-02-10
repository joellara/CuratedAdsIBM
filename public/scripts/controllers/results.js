angular.module('curatedAdsIBM')
    .controller('ResultsCtrl',function ($scope, $http){
        $scope.labelsGender = ["Hombre","Mujer"];
        $scope.dataGender = [];
        $scope.labelsAges = [];
        $scope.dataAges = [];
        $scope.maleCount = 0;
        $scope.femaleCount = 0;
        $scope.ages = {};
        $scope.getDocs = function(){
            $http.get('/getdocs').then(function successCallback(response){
                var rstArr = JSON.parse(response.data.data);
                for(let i = 0;i<rstArr.length;i++){
                    var doc = rstArr[i].doc;
                    if($scope.ages.hasOwnProperty(doc.age)){
                        $scope.ages[doc.age] = $scope.ages[doc.age] + 1;
                    }else{
                        $scope.ages[doc.age] = 1;
                    }
                    if(doc.gender === "FEMALE"){
                        $scope.femaleCount++;
                    }else{
                        $scope.maleCount++;
                    }
                    if(i == rstArr.length -1){
                        $scope.dataGender = [$scope.maleCount,$scope.femaleCount];
                    }
                }
                for(obj in $scope.ages){
                    $scope.labelsAges.push(obj);
                    $scope.dataAges.push($scope.ages[obj]);
                }
            },function errorCallback(response){
                console.err(response);
            });
        };
    });