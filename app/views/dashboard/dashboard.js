'use strict';

angular.module('cliffhanger.dashboard', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}])

.controller('DashboardCtrl', function ($rootScope, $log, $scope, $q, $filter, $location) {

    $scope.testGlobal = function () {
        $log.log($rootScope);
    };

    $scope.tags = [
        {
            name: "SSN",
            description: "social security",
        },
        {
            name: "ZIP",
            description: "zip code"
        },
        {
            name: "address1",
            description: "first line of addresss"
        }
    ]

    $scope.loadTags = function (query) {
        var deferred = $q.defer();
        var filteredTags = $filter('filter')($scope.tags, {
            name: query
        });

        if (filteredTags.length == 0) $scope.noResults = true;
        else $scope.noResults = false;

        deferred.resolve(filteredTags);

        return deferred.promise;
    };

    $scope.pickDeveloper = function () {
        $rootScope.isDeveloper = true;
        $rootScope.isAnalyst = false;
        $location.path("developer/datasets");
    }

    $scope.pickAnalyst = function () {
        $rootScope.isAnalyst = true;
        $rootScope.isDeveloper = false;
        $location.url("analyst/compare");
    }



});
