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
                when('/cache', {
                    templateUrl: '/static/views/cache.html',
                    controller: 'CacheController'
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

            $scope.languages = [
                {name: "german", value: "de"},
                {name: "english", value: "en"},
                {name: "spanish", value: "es"},
                {name: "french", value: "fr"}
            ];

            $scope.startCreateCorpus = function () {
                // Starts corpus creation through corpusCreationService if form is valid
                var isValid = $("form").get(0).checkValidity();
                if (isValid === true) {
                    corpusCreationService.startCorpusCreation($scope.corpus)
                        .success(function () {
                            notify("Korpus <b>" + $scope.corpus.title + " </b>wird erstellt");
                            $rootScope.$emit("corpus:create:start");
                        }).error(function () {
                            notify("Bitte angaben korrigieren", "error");
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

    .directive('twDate', function() {
        return {
            restrict: 'A',
            scope: {
                ngModel: "="
            },
            require: 'ngModel',

            link: function($scope, elm, attrs) {
                var isStartDate = (elm.find('.start-date').length > 0) ? true : false;

                var picker = new Pikaday({
                    field: elm[0],
                    bound: false,
                    onSelect: function(date) {
                        $scope.ngModel = date || new Date();
                        //startPicker.setMinDate(moment());
                        //endPicker.setMinDate(moment());

                        if (!isStartDate) {
                             console.log(isStartDate);

                        }
                        $scope.$apply();
                    }
                });

                if (isStartDate) {
                    var today = moment();
                    var tenDaysAgo = today.add('days', -10);
                    picker.setMaxDate(moment());
                    $scope.ngModel = new Date(tenDaysAgo.format());
                } else {
                    var today = moment();
                    picker.setMaxDate(today);
                    $scope.ngModel = new Date(today.format());
                }

                $scope.$watch('ngModel', function(newValue, oldValue) {
                        picker.setDate(newValue, true);
                });
            }
        }
    })

    .controller('twDateRangeController', ["$scope",
        function ($scope) {

            $scope.$watch('corpus.startDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue > $scope.corpus.endDate) $scope.corpus.startDate = $scope.corpus.endDate;
            });

            $scope.$watch('corpus.endDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue < $scope.corpus.startDate) $scope.corpus.endDate = $scope.corpus.startDate;
            });
        }]);