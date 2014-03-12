tworpusApp

    .directive('twCorpusProgress', ["corpusCreations", function (corpusCreations) {
        return {
            templateUrl: '/static/views/corpus_creation_progress.html',
            replace: true,
            scope: {
                progresses: "="
            },
            link: function ($scope, $elm, $attrs) {
            },

            controller: function ($scope) {
                corpusCreations.getProgress().success(function (data) {
                    console.log("performed progress search in service", data);
                })
            }
        }
    }])

    .service('corpusCreations', ['$http', function ($http) {
        var service = {
            corpusCreations: []
        };

        service.getProgress = function () {
            return $http.get("/api/progress");
        };

        return service;
    }])
;


tworpusApp.controller('ProgressController', ['$scope', '$http', 'corpusCreations', function ($scope, $http, corpusCreations) {
    $scope.showProgressbar = true;
    var creationProcesses = corpusCreations;
    $scope.corpusCreationProcesses = corpusCreations.corpusCreations;
    $scope.corpusCreationProcesses.push("abc");

    $scope.$watch("showProgressbar", function (newValue, oldValue) {
        console.log("sdlkfölsakfölaksdjlöakjdöl")
    });

    $scope.toggleShowProgressbar = function () {
        console.log("click event")
        $scope.showProgressbar = !$scope.showProgressbar;
    };

    $http.get("/api/activesessions").success(function(data) {
        $scope.activeSessions = data;
    });


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
}]);