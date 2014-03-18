angular.module("tworpusApp.progress.services", [])
    .service('corpusCreations', ['$http', 'urls', function ($http, urls) {
        var that = this;

        this.corpusCreationProcesses = [];

        this.pause = function(id) {

        };

        this.fetch = function (id) {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    that.corpusCreationProcesses = data;
                });
        };

        this.fetchAll = function () {
            return $http
                .get(urls.sessions)
                .success(function (data) {
                    that.corpusCreationProcesses = data;
                });
        };
    }])
;


// brainstorm progress service
/*
 - Progress(bar) besteht aus:
 title, numTweets, numChars, numWords, startDate, endDate, id
 working (bool), completed (bool)
 @TODO: progress (x/y Tweets gedownloaded), Name des aktuellen Schritts, ?Schritt-Nummer / Schritte insgesamt?

 - Service:
 Liste ALLER erstellten Korpora
 Filter um unvollständige/arbeitende Prozesse zu finden
 */