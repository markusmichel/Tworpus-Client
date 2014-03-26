
pieChartConfig = {
    width: 250,
    height: 250,
    colors: ["#DFFB3F", "#ED5565", "#EBEBEB"]
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
                        .innerRadius(radius - 100);

                function arcTween(a) {
                          var i = d3.interpolate(this._current, a);
                          this._current = i(0);
                          return function(t) {
                            return arc(i(t));
                        };
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
                    .attr("transform", function(d) {
                            d.innerRadius = 0;
                            d.outerRadius = radius;
                            return "translate(" + arc.centroid(d) + ")";
                     })
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold");

                path.transition().duration(750).attrTween("d", arcTween);
                text.transition().duration(750).attr("transform", function(d) {
                        d.innerRadius = 0;
                        d.outerRadius = radius;
                        return "translate(" + arc.centroid(d) + ")";
                    });
                text.text(function(d, i) {
                    if (data[i] == 0) return null;
                    return data[i];
                });

                path.exit().remove();
                text.exit().remove();
        };

var createCorpusView = function(item, elm) {
    var title = $('<div></div>')
                .text(item.title)
                .addClass('corpus-view-title');

            var created = $('<div></div>')
                .addClass('corpus-view-details-created')
                .text("Created at: " + moment(item.created).format('MM/DD/YYYY'));


            var minPerTweet = $('<div></div>')
                .addClass('corpus-view-details-minimum')
                .append($('<div></div>').text("Min Chars/Tweet: " + item.minCharsPerTweet))
                .append($('<div></div>').text("Min Words/Tweet: " + item.minWordsPerTweet));


            var tweetsFetched = $('<div></div>').text("Tweets fetched: " + item.tweetsFetched);
            var tweetsFailed = $('<div></div>').text("Tweets failed: " + item.tweetsFailed);

            var tweetsStats = $('<div></div>')
                .addClass('corpus-view-details-tweets')
                .append($('<div></div>').text("Total tweets: " + item.numTweets))
                .append(tweetsFetched)
                .append(tweetsFailed);

            var lang = $('<div></div>')
                .addClass('corpus-view-details-language')
                .text("Language: " + item.language);

            var details = $('<div></div')
                .addClass('corpus-view-details')
                .append(lang)
                .append(minPerTweet)
                .append(created)
                .append(tweetsStats);

            var outerDetails = $('<div></div')
                .addClass('corpus-view-outer-details')
                .append(details);

            var deleteBtn = $('<div></div')
                .addClass('corpus-view-buttonbar-delete');

            var renewBtn = $('<div></div')
                .addClass('corpus-view-buttonbar-renew');

            var exportBtn = $('<div></div')
                .addClass('corpus-view-buttonbar-export');

            var buttonbar = $('<div></div')
                .append(deleteBtn)
                .append(renewBtn)
                .append(exportBtn)
                .addClass('corpus-view-buttonbar');

            var outerButtonbar = $('<div></div')
                .addClass('corpus-view-outer-buttonbar')
                .append(buttonbar);

            elm
                .append(title)
                .append(outerDetails)
                .append(outerButtonbar)
                .hover(function(el) {
                    details.addClass('move-in');
                    buttonbar.addClass('move-in');
                }, function() {
                    details.removeClass('move-in');
                    buttonbar.removeClass('move-in');
                });

            return [tweetsFetched, tweetsFailed];
};

tworpusApp

    .controller("CorporaController",["$scope", "corpusCreations", function($scope, corpusCreations){
        $scope.corpusCreations = corpusCreations.corpusCreationProcesses;
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

                var tweetsFields = createCorpusView(corpusItem, elm);
                var pieChart = createPieChart(elm);

                updatePieChart(pieChart, [
                    corpusItem.tweetsFetched,
                    corpusItem.tweetsFailed,
                    corpusItem.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed
                ]);

                $scope.processes = corpusCreations.corpusCreationProcesses;
                $scope.$watch("ngModel", function(item) {

                    if (item.progress <= 100) {

                        tweetsFields[0].text("Tweets fetched: " + item.tweetsFetched);
                        tweetsFields[1].text("Tweets failed: " + item.tweetsFailed);

                        updatePieChart(pieChart, [
                            item.tweetsFetched,
                            item.tweetsFailed,
                            item.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed]
                        );
                    }

                }, true);
            }
        }
    }]);

