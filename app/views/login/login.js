angular.module('cliffhanger.users', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/login/login.html',
        controller: 'LoginCtrl'
    });
}]).controller('LoginCtrl', function ($rootScope, $log, $scope, $q, $location, userService) {
    $scope.newUser = {};
    $rootScope.theme = {};
    $rootScope.theme.color = 'white';
    //alerts for errors
    $scope.alerts = [];
    $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        }
        //    $scope.pickDeveloper = function () {
        //        $rootScope.isDeveloper = true;
        //        $rootScope.isAnalyst = false;
        //        $rootScope.theme.color = 'green';
        //        $location.path('developer/datasets');
        //    }
        //
        //    $scope.pickAnalyst = function () {
        //        $rootScope.isAnalyst = true;
        //        $rootScope.isDeveloper = false;
        //        $rootScope.theme.color = 'blue';
        //        $location.url('analyst/compare');
        //    }
        //validate the newUser object on changes
    $scope.$watch('newUser', function () {
        //check that passwords match
        if ($scope.newUser.password != $scope.newUser.passwordConfirm) $scope.passwordMismatch = true;
        else $scope.passwordMismatch = false;
        //check that a role was selected
        if ($scope.newUser.role == null) $scope.invalidRole = true;
        else $scope.invalidRole = false;
    }, true);
    //log in as an existing user
    $scope.login = function () {
            var input = {
                username: $scope.username,
                password: $scope.password
            }
            $log.debug(input);
            //authenticate against REST service
            userService.login($scope.username, $scope.password).then(
                //success
                function (response) {
                    //analyst
                    if ($rootScope.user.roles[0] == 'ROLE_ANALYST') {
                        $rootScope.isAnalyst = true;
                        $rootScope.isDeveloper = false;
                        $rootScope.isSuper = false;
                        $rootScope.theme.color = 'blue';
                        $location.path('analyst/compare');
                    }
                    //developer
                    else if ($rootScope.user.roles[0] == 'ROLE_DEVELOPER') {
                        $rootScope.isDeveloper = true;
                        $rootScope.isAnalyst = false;
                        $rootScope.isSuper = false;
                        $rootScope.theme.color = 'green';
                        $location.path('developer/datasets');
                    }
                    //superuser
                    else {
                        $rootScope.isSuper = true;
                        $rootScope.isAnalyst = false;
                        $rootScope.isDeveloper = false;
                        $rootScope.theme.color = 'light-gray';
                        $location.path('superuser/users'); //temporary until super user landing page created
                    }

                }, //error
                function (error) {
                    $log.error(error);
                    $scope.alerts.push('Failed to connect to authentication service!');
                    //TODO add unsuccessful login alert
                });
        }
        //create a new user account
    $scope.register = function () {
        var input = {
            username: $scope.newUser.username,
            password: $scope.newUser.password,
            role: {
                authority: $scope.newUser.role
            }
        }
        $log.debug(input);
        //create new user with REST service
        userService.register(input).then(
            //successful account creation
            function (response) {
                if (response.status == 'Success') {
                    //use login() to authenticate
                    $scope.username = $scope.newUser.username;
                    $scope.password = $scope.newUser.password;
                    $scope.login();
                }
                //error
                else {
                    $log.error(response.data);
                    $scope.alerts.push(response.data);
                }
            }, //error
            function (error) {
                $log.error(error);
                //add unsuccessful account creation alert
                $scope.alerts.push('Failed to connect to authentication service!');
            });
    }
});