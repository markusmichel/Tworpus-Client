
pieChartConfig = {
    width: 200,
    height: 200,
    radius: 100,
    colors: ["#DFFB3F", "#ED5565", "#EBEBEB"]
};

createPieChart = function(tweetsFetched, selector) {

    var w = pieChartConfig.width;
    var h = pieChartConfig.height;
    var r = pieChartConfig.radius;

    var color = d3.scale.category20c();

    var data = [
        {"label":tweetsFetched.fetched, "value":tweetsFetched.fetched},
        {"label":tweetsFetched.failed, "value":tweetsFetched.failed}
    ];

    if (tweetsFetched.pending != 0) {
     data.push({"label":tweetsFetched.pending, "value":tweetsFetched.pending})
    }

    var vis = d3.select(selector.get(0))
        .append("svg:svg")
        .data([data])
        .attr("width", w)
        .attr("height", h)
        .append("svg:g")
        .attr("transform", "translate(" + r + "," + r + ")");

    var arc = d3.svg.arc().outerRadius(r);

    var pie = d3.layout.pie().value(function(d) { return d.value; });

    var arcs = vis.selectAll("g.slice")
            .data(pie)
            .enter()
            .append("svg:g")
         .attr("class", "slice");

    arcs.append("svg:path")
        .attr("fill", function(d, i) {  return pieChartConfig.colors[i]; } )
        .attr("d", arc);

    arcs.append("svg:text")
        .attr("transform", function(d) {
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return "translate(" + arc.centroid(d) + ")";
                })
        .attr("text-anchor", "middle")
        .text(function(d, i) { return data[i].label; });
 };

tworpusApp

    .controller("CorporaController",["$scope", "corpusCreations", function($scope, corpusCreations){
        $scope.corpusCreations = corpusCreations.corpusCreationProcesses;
        corpusCreations.fetchAll();
    }])

    .directive("twCreateCorporaView", [function() {

        return {
            restrict: 'A',
            scope: {
                ngModel: "="
            },
            require: 'ngModel',

            link: function($scope, elm, attrs) {

                var corpusItem = $scope.ngModel;
                if (!corpusItem) return;

                console.log(corpusItem);

                var title = $('<div></div>')
                    .text(corpusItem.title)
                    .addClass('corpus-view-title');

                var created = $('<div></div>').text("Created at: " + moment(corpusItem.created).format('MM/DD/YYYY'));
                var minCharsPerTweet = $('<div></div>').text("Min Chars/Tweet: " + corpusItem.minCharsPerTweet);
                var minWordsPerTweet = $('<div></div>').text("Min Words/Tweet: " + corpusItem.minWordsPerTweet);
                var lang = $('<div></div>').text("Language: " + corpusItem.language);

                var details = $('<div></div')
                    .addClass('corpus-view-details')
                    .append(lang)
                    .append(minCharsPerTweet)
                    .append(minWordsPerTweet)
                    .append(created);

                var outerDetails = $('<div></div')
                    .addClass('corpus-view-outer-details')
                    .append(details);


                elm
                    .append(title)
                    .append(outerDetails)
                    .hover(function(el) {
                        details.animate({
                            top: 0
                        })
                    }, function() {
                        details.animate({
                            top: 200
                        })

                    });

                var tweetsFetchedStats = {
                    fetched: corpusItem.tweetsFetched,
                    failed: corpusItem.tweetsFailed,
                    pending: corpusItem.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed
                };

                createPieChart(tweetsFetchedStats, elm);
            }
        }
    }]);

