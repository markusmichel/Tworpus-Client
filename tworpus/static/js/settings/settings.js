angular
    .module("tworpusApp.cache", ['ngAnimate'])

    .controller("SettingsController", ["$scope", "$http", "urls", "notify", function ($scope, $http, urls, notify) {
        $scope.clearCache = function () {
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