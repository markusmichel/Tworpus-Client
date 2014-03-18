angular.module("tworpusApp.progress", ["tworpusApp.progress.services"])
    .directive('twCorpusProgress', [function () {
        return {
            templateUrl: '/static/views/corpus_creation_progress.html',
            replace: true,
            scope: {
                twProgresses: "="
            },
            link: function ($scope, $elm, $attrs) {
                $scope.$parent.$watch("showProgressbar", function (newValue, oldValue) {
                    if (newValue === true) $("body").addClass("progressbar-expanded");
                    else $("body").removeClass("progressbar-expanded");
                });
            }
        };
    }])

    .controller('ProgressController', ['$scope', '$rootScope', '$http', 'corpusCreations', 'urls',
        function ($scope, $rootScope, $http, corpusCreations, urls) {
            $scope.corpusCreationProcesses = corpusCreations.corpusCreationProcesses;
            $scope.showProgressbar = false;

            // Updates the list of sessions
            var update = function () {
                corpusCreations.fetchAll()
                    .then(function () {
                        $scope.corpusCreationProcesses = corpusCreations.corpusCreationProcesses;
                        console.log("updated: ", $scope.corpusCreationProcesses)
                    });
            };
            update();

            $scope.$watch("corpusCreationProcesses", function () {
                console.log("CHANGE");
            }, true);

            // Show progressbar when CreateCorpusController emits start
            $rootScope.$on("corpus:create:start", function () {
                $scope.showProgressbar = true;
                update();
            });

            $scope.toggleShowProgressbar = function () {
                console.log("click event");
                $scope.showProgressbar = !$scope.showProgressbar;
            };

            $scope.updateActiveSessions = function () {
                var isWorking = false;
                $http.get(urls.activeSessions).success(function (data) {
//                    $scope.activeSessions = data;
//
//                    for (var s in $scope.activeSessions) {
//                        $scope.activeSessions[s].working = isWorking;
//                        isWorking = !isWorking;
//                    }
                    update();
                });
            };

            // Completely removes a corpus
            // @TODO: extract service
            $scope.removeCorpus = function (id) {
                console.log("ajax remove corpus", id);
                var url = urls.removeCorpus + "?corpusid=" + id;
                $http.get(url).success(function () {
                    console.log("success")
                    $scope.updateActiveSessions();
                }).error(function () {
                    console.log("error");
                });
            };

            // Pause a specific coprus creation process.
            // Specified by the session's id.
            $scope.pause = function (id) {
                console.log("pause corpus ", id);
                $http.get(urls.pauseCorpus + "?id=" + id)
                    .then(function() {
                        update();
                    });
            };

            // @TODO: Prozesse der Direktive übergeben. Diese überwacht dann die Prozesse und stellt die Progressbars dar oder nicht
            $scope.$watch("corpusCreationProcesses", function (newValue) {
                console.log("changed")
                if ($scope.corpusCreationProcesses.length == 0) {
                    console.log("empty");
                    $scope.showProgressbar = false;
                }
            });
        }])
;

//    setInterval(function() {
//        $scope.toggleShowProgressbar();
//    }, 2000);

//    $http.get('/api/progress').success(function (data) {
//        $scope.progress = data;
//    });
//    var id = $("#sid").data("sessionid");
//    var socket = io.connect('http://localhost:3000');
//    socket.emit("connect", id);
//    socket.on('corpuscreation_progress', function (data) {
//        var status = JSON.parse(data);
//        $scope.progress = status;
//        console.log("set new status: ", status);
//
//        // 1 = download tweets
//        // 2 = save tweets to file
//        switch (status.task) {
//            case 1:
//                var currentStep = status.steps[0],
//                    totalFetched = currentStep.numFetched + currentStep.numFailed,
//                    percent = totalFetched / currentStep.numTotal * 100;
//
//                $scope.percent = percent;
//                $scope.style = function(value) {
//                    return { "width": percent + "%" };
//                }
//                break;
//            case 2:
//                var currentStep = status.steps[1];
//                $("#progress-progress").text("Speichere tweet " + currentStep.numSaved + " / " + currentStep.numTotal);
//                if (currentStep.numSaved === currentStep.numTotal) $("form").trigger("corpusCreationFinished");
//                break;
//        }
//
//        $scope.$apply();
//    });