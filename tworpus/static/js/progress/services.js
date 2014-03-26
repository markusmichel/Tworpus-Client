angular.module("tworpusApp.progress.services", [])
    .service('corpusCreations', ['$http', '$filter', 'urls', 'socketId', 'notify', function ($http, $filter, urls, socketId, notify) {
        var that = this;
        this.corpusCreationProcesses = [];

        this.pause = function (id) {

        };

        var isPolling = false,
            // Minimum tries until exit polling
            pollCounter = 0;
        this.longPoll = function () {
            if(isPolling) return;
            else doPoll();
        };

        var doPoll = function() {
            isPolling = true;
            var unfinishedProcesses = $filter('working')(that.corpusCreationProcesses);

            // Exit if there are no more processes to watch
            if (unfinishedProcesses.length === 0 && ++pollCounter >= 3) {
                isPolling = false;
                pollCounter = 0;
                return;
            }

            angular.forEach(unfinishedProcesses, function (process) {
                that.fetch(process.id);
            });

            setTimeout(function () {
                doPoll();
            }, 200);
        };

        this.fetch = function (id) {
            return $http
                .get(urls.session + "?id=" + id)
                .success(function (data) {
                    var index = $filter('indexOfCorpusid')(that.corpusCreationProcesses, data.id),
                        session = that.corpusCreationProcesses[index];

                    // @TODO: null check
                    session.progress        = data.progress;
                    session.completed       = data.completed;
                    session.working         = data.working;
                    session.tweetsFetched   = data.tweetsFetched;
                    session.tweetsFailed    = data.tweetsFailed;
                });
        };

        this.fetchAll = function () {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    angular.forEach(data, function (session, index) {
                        var oldProcess = that.corpusCreationProcesses[session.id];
                        if (typeof oldProcess === "undefined") that.corpusCreationProcesses[session.id] = session;

                        // @TODO: update session if is defined
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
                        notify("Corpus " + removed.title + " couldn't be removed");
                    });
            } else {
                // Should never happen
                notify("Element could not be found");
            }
        }
    }])
;