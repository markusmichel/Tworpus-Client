angular
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
;