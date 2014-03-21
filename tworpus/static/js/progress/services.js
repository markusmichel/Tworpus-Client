angular.module("tworpusApp.progress.services", [])
    .service('corpusCreations', ['$http', 'urls', 'socketId', function ($http, urls, socketId) {
        var that = this;
        this.corpusCreationProcesses = [];

       // @TODO: extract id
        var socket = io.connect('http://localhost:3000');
        socket.emit("connect", socketId);

        socket.on('corpuscreation_progress', function (data) {
            var process = JSON.parse(data);

            that.fetchAll();
//            angular.copy([data], that.corpusCreationProcesses);
            console.log("STATUS UPDATE: ", process, that.corpusCreationProcesses);
        });

        this.pause = function (id) {

        };

        this.fetch = function (id) {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    angular.copy(data, that.corpusCreationProcesses);
                });
        };

        this.fetchAll = function () {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    angular.copy(data, that.corpusCreationProcesses);
                });
        };
    }])
;