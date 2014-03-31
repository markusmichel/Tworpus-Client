
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

    .controller("CorporaController",["$scope", "corpusCreations", "urls", function($scope, corpusCreations, urls){
        $scope.corpusCreations = corpusCreations.corpusCreationProcesses;
        $scope.remove = corpusCreations.remove;

        $scope.download = function(id) {
            window.location = urls.downloadCorpus + "?id=" + id;
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

                }, true);
            }
        }
    }]);

