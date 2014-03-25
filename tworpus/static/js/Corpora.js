
pieChartConfig = {
    width: 300,
    height: 300,
    radius: 100,
    colors: ["#DFFB3F", "#ED5565"]
};

createPieChart = function(tweetsFetched, tweetsFailed) {

    var w = pieChartConfig.width;
    var h = pieChartConfig.height;
    var r = pieChartConfig.radius;

    var color = d3.scale.category20c();

    data = [
        {"label":tweetsFetched, "value":tweetsFetched},
        {"label":tweetsFailed, "value":tweetsFailed}
    ];

    var vis = d3.select(".corpusPieChart")
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
                var title = $('<div></div>').text(corpusItem.title);
                var pieChartDiv = $('<div></div>').addClass('corpusPieChart');
                elm.append(title)
                    .append(pieChartDiv);
                createPieChart(corpusItem.tweetsFetched,corpusItem.tweetsFailed);
            }
        }
    }]);

