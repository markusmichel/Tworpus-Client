/**
 * CorpusCreation based services for communication with django REST API
 */

angular.module("createCorpus.services", [])
    .service("corpusCreationService", ['$http', 'urls', function ($http, urls) {
        this.startCorpusCreation = function (query) {

            query.startDateTimestamp = query.startDate;
            query.startDateTimestamp.setHours(0);
            query.startDateTimestamp.setMinutes(0);
            query.startDateTimestamp = query.startDateTimestamp.getTime();

            query.endDateTimestamp = query.endDate;
            query.endDateTimestamp.setHours(0);
            query.endDateTimestamp.setMinutes(0);
            query.endDateTimestamp = query.endDateTimestamp.getTime();

            return $http({
                method: 'POST',
                url: urls.startCreateCorpus,
                data: query
            });
        };
    }])
;