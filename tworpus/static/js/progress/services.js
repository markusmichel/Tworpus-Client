angular.module("tworpusApp.progress.services", [])
    .service('corpusCreations', ['$http', '$filter', 'urls', 'socketId', 'notify', function ($http, $filter, urls, socketId, notify) {
        var that = this;
        this.corpusCreationProcesses = [];

        // @TODO: extract id
//        var socket = io.connect('http://localhost:3000');
//        socket.emit("connect", socketId);

//        socket.on('corpuscreation_progress', function (data) {
//            var process = JSON.parse(data);

//            console.log("STATUS UPDATE: ", process, that.corpusCreationProcesses);
//            that.fetch(process.id);
//            angular.copy([data], that.corpusCreationProcesses);
//        });

        this.pause = function (id) {

        };

        var isPolling = false;
        this.longPoll = function () {
            isPolling = true;
            var unfinishedProcesses = $filter('unfinished')(this.corpusCreationProcesses);

            // Exit if there are no more processes to watch
            if (unfinishedProcesses.length === 0) return;

            angular.forEach(unfinishedProcesses, function (process) {
                console.log("fetch...");
                that.fetch(process.id);
            });

            setTimeout(function () {
                that.longPoll();
            }, 200);
        };

        this.fetch = function (id) {
            return $http
                .get(urls.session + "?id=" + id)
                .success(function (data) {
                    var index = $filter('indexOfCorpusid')(that.corpusCreationProcesses, data.id),
                        session = that.corpusCreationProcesses[index];
                    session.progress = data.progress;
                    session.completed = data.completed;
                    session.working = data.working;
                    console.log("fetched", session);
                });
        };

        this.fetchAll = function () {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    console.log("current processes: ", that.corpusCreationProcesses);
                    angular.forEach(data, function (session, index) {
                        var oldProcess = that.corpusCreationProcesses[session.id];
                        if (typeof oldProcess === "undefined") that.corpusCreationProcesses.push(session);
                    });
                });
        };

        this.remove = function (id) {
            var index = $filter('indexOfCorpusid')(this.corpusCreationProcesses, id),
                removed = this.corpusCreationProcesses.splice(index, 1),
                url = urls.removeCorpus + "?corpusid=" + id;

            if (removed.length > 0) {
                removed = removed[0];
                $http.get(url)
                    .success(function () {
                        notify("Korpus <b>" + removed.title + " </b>wurde entfernt");
                    })
                    .error(function () {
                        notify("Korpus " + removed.title + " konte nicht geköscht werden");
                    });
            } else {
                // Should never happen
                notify("Element konnte nicht gefunden werden");
            }
        }
    }])
;