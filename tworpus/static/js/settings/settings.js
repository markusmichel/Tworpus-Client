angular
    .module("tworpusApp.cache", ['ngAnimate'])

    .controller("SettingsController", ["$scope", "$http", "urls", "notify", "corpusCreations", function ($scope, $http, urls, notify, corpusCreations) {

        var processInProgress = false;
        corpusCreations.fetchAll();

        $scope.$watch(function() {
             return corpusCreations.corpusCreationProcesses
         }, function(processes) {
             processInProgress = false;
             for (var i = 0; i < processes.length; i++) {
                if (processes[i].working === true) {
                    processInProgress = true;
                    break;
                }
            }
            if (processInProgress) $('.btn-danger').addClass('btn-disabled');
            else  $('.btn-danger').removeClass('btn-disabled');
         }, true);

        $scope.clearCache = function () {
            if (processInProgress) return;

            $scope.showClearConfirmation = false;
            $http
                .post(urls.clearCache)
                .success(function () {
                    notify("Cache cleared");
                    update();
                })
                .error(function () {
                    notify("Failed to clear cache");
                });
        };

        var update = function () {
            $http
                .get(urls.cacheStatus)
                .success(function (data) {
                    $scope.numFiles = data.numFiles;
                    $scope.size = data.size;
                });
        };
        update();

        var updateInterval = setInterval(update, 5000);

        $scope.$on("$destroy", function () {
            clearInterval(updateInterval);
        });

        $scope.showClearConfirmation = false;

        $scope.displayClearConfirmation = function() {
            if (processInProgress)  $scope.showClearConfirmation = false;
            else $scope.showClearConfirmation = true;
        };
    }])

    .filter('bytes', function () {
        return function (bytes, precision) {
            if (bytes === 0) return '0 bytes';
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    });