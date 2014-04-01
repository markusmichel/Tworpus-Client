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

            $scope.corpus = {};

            //no values resets form
            var setFormValues = function(formValues) {
                if (!formValues) formValues = {};
                if (!formValues.endDate) formValues.endDate = moment().add('days', 1).toDate();
                if (!formValues.startDate) formValues.startDate = moment().subtract('days', 10).toDate();
                if (!formValues.numTweets) formValues.numTweets = 20;
                if (!formValues.numMinWords) formValues.numMinWords = 0;
                if (!formValues.numMinChars) formValues.numMinChars = 0;
                if (!formValues.language) formValues.language = "";
                if (!formValues.title) formValues.title = "";

                $scope.corpus.endDate = moment(formValues.endDate).toDate();
                $scope.corpus.startDate = moment(formValues.startDate).toDate();

                $scope.corpus.language = formValues.language;

                $('#input_slider_num_tweets').attr('data-slider-value', formValues.numTweets);
                $scope.corpus.numTweets = formValues.numTweets;

                 $('#input_slider_min_chars').attr('data-slider-value', formValues.numMinWords);
                $scope.corpus.numMinWords = formValues.numMinWords;

                $('#input_slider_min_words').attr('data-slider-value', formValues.numMinChars);
                $scope.corpus.numMinChars = formValues.numMinChars;

                $scope.corpus.title = formValues.title;
            };
            setFormValues(JSON.parse(localStorage.getItem('formValues')));

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

                    setFormValues();

                    corpusCreationService.startCorpusCreation($scope.corpus)
                        .success(function (data, status) {
                            switch (status) {
                                case 206:
                                    notify("Corpus <b>" + $scope.corpus.title + " </b>is being created, " +
                                        "but there are not sufficient tweets available.", "info");
                                    break;
                                default:
                                    notify("Corpus <b>" + $scope.corpus.title + " </b>is being created.");
                                    break;
                            }
                            $rootScope.$emit("corpus:create:start");
                        }).error(function (data, status) {
                            switch(status) {
                                case 444:
                                    notify("No tweets found to fetch. Try to be less specific.", "error");
                                    break;
                                default:
                                    notify("Failed to fetch tweets.", "error");
                                    break;
                            }
                        });
                }
            };

        var saveIntoLocalStorage = function() {
            localStorage.setItem('formValues', JSON.stringify({
                endDate: $scope.corpus.endDate || null,
                startDate: $scope.corpus.startDate || null,
                language: $scope.corpus.language || "",
                numMinChars: $scope.corpus.numMinChars || 0,
                numMinWords: $scope.corpus.numMinWords || 0,
                numTweets: $scope.corpus.numTweets || 20,
                title: $scope.corpus.title || ""
            }));
        };

        $scope.$on("$destroy", function () {
            saveIntoLocalStorage();
        });

        window.onbeforeunload = function () {
            saveIntoLocalStorage();
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
            $scope.$watch('corpus.startDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue > $scope.corpus.endDate) $scope.corpus.startDate = $scope.corpus.endDate;

                $scope.corpus.endDate.minDate = newValue;
            });

            $scope.$watch('corpus.endDate', function (newValue, oldValue) {
                if (!$scope.corpus) return;
                if (newValue < $scope.corpus.startDate) $scope.corpus.endDate = $scope.corpus.startDate;

                $scope.corpus.startDate.maxDate = newValue;
            });
        }]);