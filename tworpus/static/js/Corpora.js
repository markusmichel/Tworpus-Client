
pieChartConfig = {
    width: 250,
    height: 250,
    radius: 125,
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
                if (!corpusItem) {
                    $(elm).parent().remove();
                    return;
                }

                var title = $('<div></div>')
                    .text(corpusItem.title)
                    .addClass('corpus-view-title');

                var created = $('<div></div>')
                    .addClass('corpus-view-details-created')
                    .text("Created at: " + moment(corpusItem.created).format('MM/DD/YYYY'));


                var minPerTweet = $('<div></div>')
                    .addClass('corpus-view-details-minimum')
                    .append($('<div></div>').text("Min Chars/Tweet: " + corpusItem.minCharsPerTweet))
                    .append($('<div></div>').text("Min Words/Tweet: " + corpusItem.minWordsPerTweet));


                var tweetsFetched = $('<div></div>')
                    .addClass('corpus-view-details-tweets')
                    .append($('<div></div>').text("Tweets fetched: " + corpusItem.numTweets))
                    .append($('<div></div>').text("Tweets fetched: " + corpusItem.tweetsFailed))
                    .append($('<div></div>').text("Tweets fetched: " + corpusItem.tweetsFetched));


                var lang = $('<div></div>')
                    .addClass('corpus-view-details-language')
                    .text("Language: " + corpusItem.language);

                var details = $('<div></div')
                    .addClass('corpus-view-details')
                    .append(lang)
                    .append(minPerTweet)
                    .append(created)
                    .append(tweetsFetched);

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

                var tweetsFetchedStats = {
                    fetched: corpusItem.tweetsFetched,
                    failed: corpusItem.tweetsFailed,
                    pending: corpusItem.numTweets - corpusItem.tweetsFetched - corpusItem.tweetsFailed
                };

                createPieChart(tweetsFetchedStats, elm);
            }
        }
    }]);

