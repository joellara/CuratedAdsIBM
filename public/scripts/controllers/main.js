angular.module('curatedAdsIBM')
    .controller('MainCtrl', function ($scope, $http) {
        var _video = null,
            patData = null;

        $scope.result = undefined;

        $scope.patOpts = {
            x: 0,
            y: 0,
            w: 10,
            h: 10
        };
        $scope._player = undefined;
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
                patData = idata;
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
                    if ($scope.result.averageAge < 18) {
                        $scope.result.parsedGender = "Mujer";
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 18 mujer";
                    } else if ($scope.result.averageAge < 30) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 30 mujer";
                    } else if ($scope.result.averageAge < 60) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 60 mujer";
                    }
                } else {
                    $scope.result.parsedGender = "Hombre";
                    if ($scope.result.averageAge < 18) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 18 Hombre";
                    } else if ($scope.result.averageAge < 30) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 30 hombre";
                    } else if ($scope.result.averageAge < 60) {
                        $scope.result.src = "rGKgAPveMyo";
                        $scope.result.alt = "Menor a 60 hombre";
                    }
                }
                if ($scope._player) {
                    $scope._player.playVideo();
                } else {
                    console.error("Player not detected");
                }
                $scope.tests.push({
                    age: $scope.result.averageAge,
                    gender: $scope.result.parsedGender
                });
            }, function errorCallback(response) {
                console.log(response);
            });
        };

        $scope.$on('youtube.player.ended', function ($event, player) {
            $scope.makeSnapshot();
        });

        (function () {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
            window.requestAnimationFrame = requestAnimationFrame;
        })();
    });