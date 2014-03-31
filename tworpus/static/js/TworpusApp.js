tworpusApp
    // Route definition
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/createcorpus', {
                    templateUrl: '/static/views/create_corpus_content.html',
                    controller: 'CreateCorpusController'
                }).
                when('/corpora', {
                    templateUrl: '/static/views/corpora.html',
                    controller: 'CorporaController'
                }).
                when('/settings', {
                    templateUrl: '/static/views/settings.html',
                    controller: 'SettingsController'
                }).
                otherwise({
                    redirectTo: '/createcorpus'
                });
        }
    ])

    .controller('CreateCorpusController', ["$scope", "$rootScope", "$http", "urls", "corpusCreationService", "notify",
        function ($scope, $rootScope, $http, urls, corpusCreationService, notify) {
            $scope.slider = {};
            $scope.slider.config = {};
            $scope.slider.config.minTweetLength = 0;
            $scope.slider.config.maxTweetLength = 140;
            $scope.corpus = {};

            $scope.languages = [
                {name: "German", value: "de"},
                {name: "English", value: "en"},
                {name: "Spanish", value: "es"},
                {name: "French", value: "fr"},
                {name: "Italian", value: "it"},
                {name: "Dutch", value: "nl"},
                {name: "Portuguese", value: "pt"},
                {name: "Turkish", value: "tr"}
            ];

            $scope.startCreateCorpus = function () {
                // Starts corpus creation through corpusCreationService if form is valid
                var isValid = $("form").get(0).checkValidity();
                if (isValid === true) {
                    corpusCreationService.startCorpusCreation($scope.corpus)
                        .success(function () {
                            notify("Korpus <b>" + $scope.corpus.title + " </b>wird erstellt");
                            $rootScope.$emit("corpus:create:start");
                        }).error(function (data, status) {
                            console.log("data: ", data)
                            console.log("status: ", status)

                            switch(status) {
                                case 409:
                                    notify("No tweets found to fetch. Try to be less specific.", "error");
                                    break;
                                default:
                                    notify("Failed to fetch tweets.", "error");
                                    break;
                            }

                        });
                }
            };
        }])

    .directive('ngBootstrapSlider', function () {
        // uses http://www.eyecon.ro/bootstrap-slider/
        return {
            restrict: 'A',
            scope: {
                ngModel: "="
            },
            require: 'ngModel',

            link: function ($scope, elm, attrs) {
                $scope.ngModel = parseInt(attrs.sliderValue) || 0;
                var slider = $(elm).slider({value: 0});
                $scope.slider = slider;

                slider.on('slide', function (e) {
                    var val = $(this).val();
                    $scope.corpus.ngModel = parseInt(val);
                    $scope.$apply();
                });
            },

            controller: function ($scope) {
                $scope.$watch('ngModel', function (newValue, oldValue) {
                    $scope.slider.slider('setValue', newValue);
                })
            }
        }
    })

    .directive('twDate', function () {
        return {
            restrict: 'A',
            scope: {
                ngModel: "=",
                minDate: "=",
                maxDate: "="
            },
            require: 'ngModel',

            link: function ($scope, elm, attrs) {
                var picker = new Pikaday({
                    field: elm[0],
                    bound: false,
                    onSelect: function (date) {
                        $scope.ngModel = date || new Date();
                        $scope.$apply();
                    }
                });

                $scope.$watch('ngModel', function (newValue, oldValue) {
                    picker.setDate(newValue, true);
                });

                $scope.$watch("minDate", function(newValue) {
                    picker.setMinDate(newValue);
                    picker.setDate($scope.ngModel, true); // need setDate to update Datepicker
                });

                $scope.$watch("maxDate", function(newValue) {
                    picker.setMaxDate(newValue);
                    picker.setDate($scope.ngModel, true); // need setDate to update Datepicker
                });
            }
        }
    })

    .controller('twDateRangeController', ["$scope",
        function ($scope) {
            var oneDayInMillis = (24*60*60*1000);

            var startDate = new Date();
            startDate.setTime(startDate.getTime() - oneDayInMillis * 10);
            $scope.$parent.corpus.startDate = startDate;

            var endDate = new Date();
            endDate.setHours(23);
            endDate.setMinutes(59);
            endDate.setTime(endDate.getTime() + oneDayInMillis);
            $scope.$parent.corpus.endDate  = endDate;

            // initialize start and end dates
            $scope.startDate = {};
            $scope.endDate = {
                maxDate: endDate
            };


            $scope.$watch('corpus.startDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue > $scope.corpus.endDate) $scope.corpus.startDate = $scope.corpus.endDate;

                $scope.endDate.minDate = newValue;
            });

            $scope.$watch('corpus.endDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue < $scope.corpus.startDate) $scope.corpus.endDate = $scope.corpus.startDate;

                $scope.startDate.maxDate = newValue;
            });
        }]);