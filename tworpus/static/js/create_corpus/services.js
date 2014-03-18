/**
 * CorpusCreation based services for communication with django REST API
 */

angular.module("createCorpus.services", [])
    .service("corpusCreationService", ['$http', 'urls', function ($http, urls) {
        this.startCorpusCreation = function (query) {
            console.log("start", query);
            return $http({
                method: 'POST',
                url: urls.startCreateCorpus,
                data: query
            })
        };
    }])
;