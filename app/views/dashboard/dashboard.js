'use strict';

angular.module('cliffhanger.dashboard', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
}])

.controller('DashboardCtrl', function ($rootScope, $log, $scope, $q, $filter, $location) {

    $scope.newUser = {};

    $rootScope.theme = {};

    $rootScope.theme.color = "white";

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
        $rootScope.theme.color = "green";
        $location.path("developer/datasets");
    }

    $scope.pickAnalyst = function () {
        $rootScope.isAnalyst = true;
        $rootScope.isDeveloper = false;
        $rootScope.theme.color = "blue";
        $location.url("analyst/compare");
    }


    //validate the newUser object on changes
    $scope.$watch('newUser', function () {
        if ($scope.newUser.role == null || $scope.newUser.password != $scope.newUser.passwordConfirm) {
            $scope.invalidNewUser = true;
        } else $scope.invalidNewUser = false;
    }, true)

    $scope.login = function () {
        var input = {
            username: $scope.username,
            password: $scope.password
        }
        $log.debug(input);

        //TODO
    }

    $scope.register = function () {
        var input = {
            username: $scope.newUser.username,
            password: $scope.newUser.password,
            role: $scope.newUser.role
        }
        $log.debug(input);

        //TODO
    }



});
