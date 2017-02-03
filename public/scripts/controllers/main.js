angular.module('curatedAdsIBM')
    .controller('MainCtrl', function ($scope, $http) {
        var _video = null;

        $scope.result = {};
        $scope.result.src = "VEX7KhIA3bU"; //coca cola base

        $scope.patOpts = {
            x: 0,
            y: 0,
            w: 10,
            h: 10
        };
        $scope.player = {
            vars:{
                autoplay: 1
            },
            player:null
        };
        $scope.channel = {};
        $scope.tests = [];

        $scope.webcamError = false;
        $scope.onError = function (err) {
            $scope.$apply(
                function () {
                    $scope.webcamError = err;
                }
            );
        };

        $scope.onSuccess = function () {
            // The video element contains the captured camera data
            _video = $scope.channel.video;
            $scope.$apply(function () {
                $scope.patOpts.w = _video.width;
                $scope.patOpts.h = _video.height;
            });
        };

        $scope.makeSnapshot = function makeSnapshot() {
            if (_video) {
                var patCanvas = document.querySelector('#snapshot');
                if (!patCanvas) return;

                patCanvas.width = _video.width;
                patCanvas.height = _video.height;
                var ctxPat = patCanvas.getContext('2d');

                var idata = getVideoData($scope.patOpts.x, $scope.patOpts.y, $scope.patOpts.w, $scope.patOpts.h);
                ctxPat.putImageData(idata, 0, 0);
                sendSnapshotToServer(patCanvas.toDataURL('image/png'));
            }
        };


        var getVideoData = function getVideoData(x, y, w, h) {
            var hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = _video.width;
            hiddenCanvas.height = _video.height;
            var ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(_video, 0, 0, _video.width, _video.height);
            return ctx.getImageData(x, y, w, h);
        };

        var sendSnapshotToServer = function sendSnapshotToServer(imgBase64) {
            $scope.snapshotData = imgBase64;

            $http.post('/detectface', {
                imgBase64
            }).then(function successCallback(response) {
                $scope.result = JSON.parse(response.data.data).images[0].faces[0];
                $scope.result.averageAge = Math.floor(($scope.result.age.min + $scope.result.age.max) / 2);
                if ($scope.result.gender.gender == "FEMALE") {
                    $scope.result.parsedGender = "Mujer";
                    if ($scope.result.averageAge < 18) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 18 mujer";
                    } else if ($scope.result.averageAge < 30) {
                        $scope.result.src = "Rm-vBq-1T1k";
                        $scope.result.alt = "Menor a 30 mujer";
                    } else{
                        $scope.result.src = "0Rmz9_jagKo";
                        $scope.result.alt = "Menor a 60 mujer";
                    }
                } else {
                    $scope.result.parsedGender = "Hombre";
                    if ($scope.result.averageAge < 18) {
                        $scope.result.src = "WhfntLl6xx0";
                        $scope.result.alt = "Menor a 18 Hombre";
                    } else if ($scope.result.averageAge < 30) {
                        $scope.result.src = "_P2WIq3DLgY";
                        $scope.result.alt = "Menor a 30 hombre";
                    } else if ($scope.result.averageAge < 60) {
                        $scope.result.src = "pOiiPxb-Gbw";
                        $scope.result.alt = "Menor a 60 hombre";
                    }else{
                        $scope.result.src = "pOiiPxb-Gbw";
                        $scope.result.alt = "Mayor a 60 hombre";
                    }
                }
                if ($scope.player.player) {
                    $scope.player.player.playVideo();
                } else {
                    console.error("Player not detected");
                }
                $scope.tests.push({
                    age: $scope.result.averageAge,
                    gender: $scope.result.parsedGender
                });
                if($scope.tests.length > 10){
                    console.log("mayor");
                    $scope.tests.shift();
                }
            }, function errorCallback(response) {
                console.log(response);
            });
        };

        $scope.$on('youtube.player.ended', function ($event, player) {
            //player
            $scope.makeSnapshot();
        });

        (function () {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
            window.requestAnimationFrame = requestAnimationFrame;
        })();
    });