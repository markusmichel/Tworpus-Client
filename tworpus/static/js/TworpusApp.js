tworpusApp.config(['$routeProvider',
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


tworpusApp.controller('CreateCorpusController', ["$scope", function ($scope) {
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
    $scope.foo = "bar";
}]);



tworpusApp.directive('ngBootstrapSlider', function () {
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

            slider.on('slide', function(e) {
                var val = $(this).val();
                $scope.ngModel = parseInt(val);
                $scope.$apply();
            });
        },

        controller: function($scope) {
            $scope.$watch('ngModel', function(newValue, oldValue) {
                $scope.slider.slider('setValue', newValue);
            })
        }
    }
});


tworpusApp.controller('SelectDateRangeController', ['$scope', function ($scope) {
    $scope.maxDate = new Date();
    $scope.startDate = new Date();
    $scope.endDate = new Date();

    $scope.$watch('startDate', function(newValue, oldValue) {
        if(newValue > $scope.endDate) $scope.startDate = $scope.endDate;
    });

    $scope.$watch('endDate', function(newValue, oldValue) {
        if(newValue < $scope.startDate) $scope.endDate = $scope.startDate;
    });
}]);