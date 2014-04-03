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

    .filter('unfinished', function () {
        return function (processes) {
            var filtered = [];
            angular.forEach(processes, function (process) {
                if (process.completed === false) filtered.push(process);
            });
            return filtered;
        };
    })

    .filter('working', function () {
        return function (processes) {
            var filtered = [];
            angular.forEach(processes, function (process) {
                if (process.working === true) filtered.push(process);
            });
            return filtered;
        };
    })

    .filter('corpusid', function () {
        return function (processes, id) {
            var filtered = null;

            for(var i in processes) {
                if (processes[i].id === id) filtered = processes[i];
                break;
            }
            return filtered;
        };
    })

    .filter('indexOfCorpusid', function () {
        return function (processes, id) {
            var index = null;
            for(var i in processes) {
                if (processes[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    })

    .controller('ProgressController', ['$scope', '$rootScope', '$http', '$filter', 'corpusCreations', 'urls',
        function ($scope, $rootScope, $http, $filter, corpusCreations, urls) {
            $scope.corpusCreationProcesses = corpusCreations.corpusCreationProcesses;
            $scope.showProgressbar = false;

            // Updates the list of sessions
            var update = function () {
                corpusCreations.fetchAll();
            };
            update();

            // Show progressbar when CreateCorpusController emits start
            $rootScope.$on("corpus:create:start", function () {
                $scope.showProgressbar = true;
                corpusCreations.fetchAll().success(function() {
//                    corpusCreations.longPoll();
                });
            });

            $scope.toggleShowProgressbar = function () {
                $scope.showProgressbar = !$scope.showProgressbar;
            };

            // Completely removes a corpus
            $scope.removeCorpus = function (id) {
                corpusCreations.remove(id);
            };

            // Pause a specific coprus creation process.
            // Specified by the session's id.
            $scope.pause = function (id) {
                $http.get(urls.pauseCorpus + "?id=" + id)
                    .then(function () {
                        update();
                    });
            };

            $scope.resume = function(id) {
                $http
                    .get(urls.resumeCorpus + "?id=" + id)
                    .then(function() {
                        corpusCreations
                            .fetch(id)
                            .then(corpusCreations.longPoll())
                        ;
                    });
            };

            var that = this;
            $scope.$watchCollection("corpusCreationProcesses", function (newValue) {
                var unfinishedProcesses = $filter('working')(corpusCreations.corpusCreationProcesses);
                if(unfinishedProcesses.length > 0) {
                    corpusCreations.longPoll();
                }
            });

            $scope.$watch("corpusCreationProcesses", function (oldValue, newValue) {
                var unfinishedProcesses = $filter('working')(corpusCreations.corpusCreationProcesses);
                if (unfinishedProcesses.length == 0) {
                    $scope.showProgressbar = false;
                }
            }, true);
        }])
;