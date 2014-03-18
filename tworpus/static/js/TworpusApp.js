tworpusApp
    // Route definition
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/createcorpus', {
                    templateUrl: '/static/views/create_corpus_content.html',
                    controller: 'CreateCorpusController'
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
                {name: "deutsch", value: "de"},
                {name: "englisch", value: "en"},
                {name: "spanisch", value: "es"},
                {name: "französisch", value: "fr"}
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
            restrict: 'ABC',
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
                    $scope.ngModel = parseInt(val);
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

    .controller('SelectDateRangeController', ['$scope', function ($scope) {
        $scope.maxDate = new Date();
        $scope.startDate = new Date();
        $scope.endDate = new Date();

        $scope.$watch('startDate', function (newValue, oldValue) {
            if (newValue > $scope.endDate) $scope.startDate = $scope.endDate;
        });

        $scope.$watch('endDate', function (newValue, oldValue) {
            if (newValue < $scope.startDate) $scope.endDate = $scope.startDate;
        });
    }]);