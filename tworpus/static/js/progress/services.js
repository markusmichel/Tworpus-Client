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
            if (unfinishedProcesses.length === 0 && ++pollCounter >= 30) {
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
            id = new String(id);
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
                        var oldProcess = $filter('indexOfCorpusid')(that.corpusCreationProcesses, session.id);
                        if (oldProcess === null) {
                            that.corpusCreationProcesses.push(session);
                        }
                        // @TODO: update session if is defined
                    });
                });
        };

        this.remove = function (id) {
            var index = $filter('indexOfCorpusid')(that.corpusCreationProcesses, id),
                removed = that.corpusCreationProcesses.splice(index, 1),
                url = urls.removeCorpus + "?corpusid=" + id;

            if (removed.length > 0) {
                removed = removed[0];
                $http.get(url)
                    .success(function () {
                        notify("Corpus <b>" + removed.title + " </b>was successfully removed");
                    })
                    .error(function () {
                        notify("Corpus " + removed.title + " couldn't be removed", "error");
                    });
            } else {
                // Should never happen
                notify("Element could not be found");
            }
        }
    }])
;