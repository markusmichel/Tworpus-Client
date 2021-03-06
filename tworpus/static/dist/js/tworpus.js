tworpusApp
    // Route definition
    .config(['$routeProvider',
        function ($routeProvider) {
            $routeProvider.
                when('/createcorpus', {
                    templateUrl: '/st/views/create_corpus_content.html',
                    controller: 'CreateCorpusController'
                }).
                when('/corpora', {
                    templateUrl: '/st/views/corpora.html',
                    controller: 'CorporaController'
                }).
                when('/settings', {
                    templateUrl: '/st/views/settings.html',
                    controller: 'SettingsController'
                }).
                otherwise({
                    redirectTo: '/createcorpus'
                });
        }
    ])

    .directive("twCreateCorpus", function () {
        return {
            restrict: 'A',

            link: function ($scope, elm, attrs) {
                $scope.$watch("availableConverters", function (newValue) {
                    if(newValue.length > 0) {
                        setTimeout(function() {
                            var $converters = $("#converters label");
                            $converters.tooltip();
                        }, 100);

                    }
                });
            }
        }
    })

    .controller('CreateCorpusController', ["$scope", "$rootScope", "$http", "urls", "corpusCreationService", "notify",
        function ($scope, $rootScope, $http, urls, corpusCreationService, notify) {
            $scope.corpus = {};

            //no values resets form
            var setFormValues = function (formValues) {
                if (!formValues) formValues = {};
                if (!formValues.endDate) formValues.endDate = moment().add('days', 1).toDate();
                if (!formValues.startDate) formValues.startDate = moment().subtract('days', 10).toDate();
                if (!formValues.numTweets) formValues.numTweets = 20;
                if (!formValues.numMinWords) formValues.numMinWords = 0;
                if (!formValues.numMinChars) formValues.numMinChars = 0;
                if (!formValues.language) formValues.language = "en";
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

            $scope.availableConverters = {};
            $http
                .get(urls.converters)
                .success(function (data) {
                    $scope.availableConverters = data;
                });

            $scope.startCreateCorpus = function () {
                // Starts corpus creation through corpusCreationService if form is valid
                var isValid = $("form").get(0).checkValidity();
                if (isValid === true) {

                    // Append converters to corpus object on form submit
                    var converters = [];
                    var $converters = $("form").find("#converters label.active input[type='checkbox']");
                    angular.forEach($converters, function (input, index) {
                        converters.push($(input).val());
                    });
                    $scope.corpus.converters = converters;

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
                            setFormValues();
                        }).error(function (data, status) {
                            switch (status) {
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

            var saveIntoLocalStorage = function () {
                localStorage.setItem('formValues', JSON.stringify({
                    endDate: $scope.corpus.endDate,
                    startDate: $scope.corpus.startDate,
                    language: $scope.corpus.language,
                    numMinChars: $scope.corpus.numMinChars,
                    numMinWords: $scope.corpus.numMinWords,
                    numTweets: $scope.corpus.numTweets,
                    title: $scope.corpus.title
                }));
            };

            $scope.$on("$destroy", function () {
                saveIntoLocalStorage();
            });

            window.onbeforeunload = function () {
                saveIntoLocalStorage();
            };

            $scope.resetForm = function () {
                setFormValues();
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

                $scope.$watch("minDate", function (newValue) {
                    picker.setMinDate(newValue);
                    picker.setDate($scope.ngModel, true); // need setDate to update Datepicker
                });

                $scope.$watch("maxDate", function (newValue) {
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
        }]);;
var pieChartConfig = {
    width: 250,
    height: 250,
    innerRadius: 80,
    colors: ["#379A8C", "#ED5564", "#EBEBEB"]
};

var createPieChart = function(selector) {
    return d3.select(selector.get(0))
                .append('svg')
                .attr("width", pieChartConfig.width)
                .attr("height", pieChartConfig.height)
                .append("svg:g")
                .attr("transform", "translate(" + pieChartConfig.width/2 + "," + pieChartConfig.height/2 + ")");
};

var updatePieChart = function(chart, data) {
    var radius = Math.min(pieChartConfig.width, pieChartConfig.height) / 2;

    var pie = d3.layout.pie()
            .startAngle(1.1*Math.PI)
            .endAngle(3.1*Math.PI)
            .sort(null)
            .value(function(d) { return d; });

    var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - pieChartConfig.innerRadius);

    function arcTween(a) {
              var i = d3.interpolate(this._current, a);
              this._current = i(0);
              return function(t) {
                return arc(i(t));
            };
    }

    function textTween(d) {
            d.innerRadius = 0;
            d.outerRadius = radius;
            return "translate(" + arc.centroid(d) + ")";
    }

    var path = chart.selectAll("path").data(pie(data));
    var text = chart.selectAll("text").data(pie(data));

    path.enter()
        .append("path")
        .attr("fill", function(d, i) {  return pieChartConfig.colors[i]; } )
        .attr("d", arc)
        .each(function(d) { this._current = d; });

    text.enter()
        .append("text")
        .attr("transform", textTween)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold");

    path.transition().attrTween("d", arcTween);
    text.transition().attr("transform", textTween);

    text.text(function(d, i) {
        if (data[i] == 0) return null;
        return data[i];
    });

    path.exit().remove();
    text.exit().remove();
};

var updateCorpusView = function(item, el) {

    var fromTo = el.find('.corpus-view-details-fromTo');
    fromTo.text(moment(item.startDate).format('MM/DD/YYYY') + " - " + moment(item.endDate).format('MM/DD/YYYY'));

    var details = el.find('.corpus-view-details');
    var buttonbar = el.find('.corpus-view-buttonbar');

    el.hover(function() {
            details.addClass('move-in');
            buttonbar.addClass('move-in');
        }, function() {
            details.removeClass('move-in');
            buttonbar.removeClass('move-in');
        });
};

tworpusApp

    .controller("CorporaController",["$scope", "$http", "corpusCreations", "urls", "notify", "$filter", function($scope, $http, corpusCreations, urls, notify, $filter){
        $scope.corpusCreations = corpusCreations.corpusCreationProcesses;
        $scope.remove = corpusCreations.remove;

        $scope.download = function(id) {
            var index = $filter('indexOfCorpusid')(corpusCreations.corpusCreationProcesses, id),
                        session = corpusCreations.corpusCreationProcesses[index];
            if (session.working) return;
            window.location = urls.downloadCorpus + "?id=" + id;
        };

        $scope.recreate = function(id) {
            var index = $filter('indexOfCorpusid')(corpusCreations.corpusCreationProcesses, id),
                        session = corpusCreations.corpusCreationProcesses[index];
            if (session.working) return;
            $http
                .post(urls.recreateCorpus + "?id=" + id)
                .success(function() {
                    notify("Corpus is being recreated");
                    corpusCreations.fetch(id).success(function() {
                        corpusCreations.longPoll();
                    });
                });
        };

        corpusCreations.fetchAll();
    }])

    .directive("twCreateCorporaView", ["corpusCreations", "$filter", function(corpusCreations, $filter) {

        return {
            restrict: 'A',
            scope: {
                ngModel: "="
            },
            require: 'ngModel',

            link: function($scope, elm, attrs) {

                var corpusItem = $scope.ngModel;
                if (!corpusItem) {
                    $(elm).parent().remove();
                    return;
                }

                var el = $(elm);
                var tweetsFetched = el.find('.corpus-view-details-tweets-fetched');
                var tweetsFailed = el.find('.corpus-view-details-tweets-failed');
                var renewButton = el.find('.corpus-view-buttonbar-renew');
                var exportButton = el.find('.corpus-view-buttonbar-export');
                var title = el.find('.corpus-view-title');

                updateCorpusView(corpusItem, el);
                var pieChart = createPieChart(elm);

                updatePieChart(pieChart, [
                    corpusItem.tweetsFetched,
                    corpusItem.tweetsFailed,
                    corpusItem.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed
                ]);

                $scope.processes = corpusCreations.corpusCreationProcesses;
                $scope.$watch("ngModel", function(item) {
                    if (item.progress <= 100) {

                        tweetsFetched.text("Tweets fetched: " + item.tweetsFetched);
                        tweetsFailed.text("Tweets failed: " + item.tweetsFailed);

                        updatePieChart(pieChart, [
                            item.tweetsFetched,
                            item.tweetsFailed,
                            item.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed]
                        );
                    }

                    if (item.working && !renewButton.hasClass('disabled')) {
                        title.toggleClass('working');
                        renewButton.toggleClass('disabled');
                        exportButton.toggleClass('disabled');

                    }
                    if (!item.working && renewButton.hasClass('disabled')) {
                        title.toggleClass('working');
                        renewButton.toggleClass('disabled');
                        exportButton.toggleClass('disabled');
                    }
                }, true);
            }
        }
    }]);

;   tworpusApp.startJoyride = function() {
             setTimeout(function() {
                $("#joyRideTipContent").joyride({
                autostart : true,
                expose : true
            });
            }, 500);
        };

        $('#help').click(tworpusApp.startJoyride);

        if (!localStorage.getItem('firstStart')) {
            localStorage.setItem('firstStart', true);

            $(window).load(function(){
               tworpusApp.startJoyride();
            });
        };/**
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
;;angular
    .module("navigation", [])
    .directive("twNavigation", ["$location", function($location) {
        return {
            "restrict": "A",
            link: function($scope, elm, attrs) {
                var elementLocation = elm.attr("href").substr(1);
                $scope.$watch(function() {
                return $location.path();
                }, function() {
                    if(elementLocation === $location.path()) elm.closest("li").addClass("active");
                    else elm.closest("li").removeClass("active");
                });
            }
        };
    }])

    .controller("NavbarController", ["$scope", "$http", "urls", function($scope, $http, urls) {
        $scope.exit = function() {
            $http.post(urls.exit)
                .success(function() {
                })
                .error(function() {

                });
        };
    }])
;;angular.module("notifications", [])
    .factory("notify", [function() {
        return function(message, type) {
            type = type || "success";

            var res = {
                text: message,
                type: type
            };
            if(type === "info") res.icon = "glyphicon glyphicon-info-sign";
            else if(type === "success") res.icon = "glyphicon glyphicon-ok-sign";

            $.pnotify(res);
        }
    }])
;;angular.module("tworpusApp.progress", ["tworpusApp.progress.services"])
    .directive('twCorpusProgress', [function () {
        return {
            templateUrl: '/st/views/corpus_creation_progress.html',
            replace: true,
            scope: {
                twProgresses: "="
            },
            link: function ($scope, $elm, $attrs) {
                $scope.$parent.$watch("showProgressbar", function (newValue, oldValue) {
                    if (newValue === true) $("body").addClass("progressbar-expanded");
                    else $("body").removeClass("progressbar-expanded");
                });
            }
        };
    }])

    .filter('unfinished', function () {
        return function (processes) {
            var filtered = [];
            angular.forEach(processes, function (process) {
                if (process.completed === false) filtered.push(process);
            });
            return filtered;
        };
    })

    .filter('working', function () {
        return function (processes) {
            var filtered = [];
            angular.forEach(processes, function (process) {
                if (process.working === true) filtered.push(process);
            });
            return filtered;
        };
    })

    .filter('corpusid', function () {
        return function (processes, id) {
            var filtered = null;

            for(var i in processes) {
                if (processes[i].id === id) filtered = processes[i];
                break;
            }
            return filtered;
        };
    })

    .filter('indexOfCorpusid', function () {
        return function (processes, id) {
            var index = null;
            for(var i in processes) {
                if (processes[i].id === id) {
                    index = i;
                    break;
                }
            }
            return index;
        };
    })

    .controller('ProgressController', ['$scope', '$rootScope', '$http', '$filter', 'corpusCreations', 'urls',
        function ($scope, $rootScope, $http, $filter, corpusCreations, urls) {
            $scope.corpusCreationProcesses = corpusCreations.corpusCreationProcesses;
            $scope.showProgressbar = false;

            // Updates the list of sessions
            var update = function () {
                corpusCreations.fetchAll();
            };
            update();

            // Show progressbar when CreateCorpusController emits start
            $rootScope.$on("corpus:create:start", function () {
                $scope.showProgressbar = true;
                corpusCreations.fetchAll().success(function() {
//                    corpusCreations.longPoll();
                });
            });

            $scope.toggleShowProgressbar = function () {
                $scope.showProgressbar = !$scope.showProgressbar;
            };

            // Completely removes a corpus
            $scope.removeCorpus = function (id) {
                corpusCreations.remove(id);
            };

            // Pause a specific coprus creation process.
            // Specified by the session's id.
            $scope.pause = function (id) {
                $http.get(urls.pauseCorpus + "?id=" + id)
                    .then(function () {
                        update();
                    });
            };

            $scope.resume = function(id) {
                $http
                    .get(urls.resumeCorpus + "?id=" + id)
                    .then(function() {
                        corpusCreations
                            .fetch(id)
                            .then(corpusCreations.longPoll())
                        ;
                    });
            };

            var that = this;
            $scope.$watchCollection("corpusCreationProcesses", function (newValue) {
                var unfinishedProcesses = $filter('working')(corpusCreations.corpusCreationProcesses);
                if(unfinishedProcesses.length > 0) {
                    corpusCreations.longPoll();
                }
            });

            $scope.$watch("corpusCreationProcesses", function (oldValue, newValue) {
                var unfinishedProcesses = $filter('working')(corpusCreations.corpusCreationProcesses);
                if (unfinishedProcesses.length == 0) {
                    $scope.showProgressbar = false;
                }
            }, true);
        }])
;;angular.module("tworpusApp.progress.services", [])
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
;;angular
    .module("tworpusApp.cache", ['ngAnimate'])

    .controller("SettingsController", ["$scope", "$http", "urls", "notify", "corpusCreations", function ($scope, $http, urls, notify, corpusCreations) {

        var processInProgress = false;
        corpusCreations.fetchAll();

        $scope.$watch(function() {
             return corpusCreations.corpusCreationProcesses
         }, function(processes) {
             processInProgress = false;
             for (var i = 0; i < processes.length; i++) {
                if (processes[i].working === true) {
                    processInProgress = true;
                    break;
                }
            }
            if (processInProgress) $('.btn').addClass('btn-disabled');
            else  $('.btn').removeClass('btn-disabled');
         }, true);

        $scope.clearCache = function () {
            if (processInProgress) return;

            $scope.showClearConfirmation = false;
            $http
                .post(urls.clearCache)
                .success(function () {
                    notify("Cache cleared");
                    update();
                })
                .error(function () {
                    notify("Failed to clear cache");
                });
        };

        var update = function () {
            $http
                .get(urls.cacheStatus)
                .success(function (data) {
                    $scope.numFiles = data.numFiles;
                    $scope.size = data.size;
                });
        };
        update();

        var updateInterval = setInterval(update, 5000);

        $scope.$on("$destroy", function () {
            clearInterval(updateInterval);
        });

        $scope.showClearConfirmation = false;

        $scope.displayClearConfirmation = function() {
            if (processInProgress)  $scope.showClearConfirmation = false;
            else $scope.showClearConfirmation = true;
        };

        $scope.setTweetsXml = function(num) {
             if (processInProgress) return;

            $http
                .post(urls.setTweetsPerXml, {tweets_per_xml: num})
                .success(function() {
                    notify("Tweets/XML successfully set to " + num);
                })
                .error(function() {
                    notify("Couldn't set Tweets/XML", "error");
                })
            ;
        };

        (function getTweetsPerXml() {
            $http
                .get(urls.getTweetsPerXml)
                .success(function(data) {
                    $scope.tweetsXml = data.tweets_per_xml;
                });
        })();
    }])

    .filter('bytes', function () {
        return function (bytes, precision) {
            if (bytes === 0) return '0 bytes';
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
        }
    });