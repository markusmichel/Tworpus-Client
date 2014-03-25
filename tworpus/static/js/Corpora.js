tworpusApp

    .controller("CorporaController",["$scope", "corpusCreations", function($scope, corpusCreations){
        $scope.corpusCreations = corpusCreations.corpusCreationProcesses;
        corpusCreations.fetchAll();

}]);