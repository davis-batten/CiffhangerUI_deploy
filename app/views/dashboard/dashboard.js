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

    $scope.pickSuperUser = function () {
        $rootScope.isSuper = true;
        $rootScope.isDeveloper = false;
        $rootScope.isAnalyst = false;
        $rootScope.theme.color = "";
    }

    //validate the newUser object on changes
    $scope.$watch('newUser', function () {
        //check that passwords match
        if ($scope.newUser.password != $scope.newUser.passwordConfirm) $scope.passwordMismatch = true;
        else $scope.passwordMismatch = false;

        //check that a role was selected
        if ($scope.newUser.role == null) $scope.invalidRole = true;
        else $scope.invalidNewUser = false;
    }, true);

    //TODO
    $scope.login = function () {
        var input = {
            username: $scope.username,
            password: $scope.password
        }
        $log.debug(input);

        //authenticate against REST service

        //update $rootScope with user profile details

        //navigate to home page for user's role
    }

    //TODO
    $scope.register = function () {
        var input = {
            username: $scope.newUser.username,
            password: $scope.newUser.password,
            role: $scope.newUser.role
        }
        $log.debug(input);

        //create new user with REST service

        //if successfull, use login() to authenticate
    }



});