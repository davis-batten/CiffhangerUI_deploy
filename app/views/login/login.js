angular.module('cliffhanger.users', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/login/login.html'
        , controller: 'LoginCtrl'
    });
}]).controller('LoginCtrl', function ($rootScope, $log, $scope, $q, $filter, $location, userService) {
    $scope.newUser = {};
    $rootScope.theme = {};
    $rootScope.theme.color = "white";
    $scope.testGlobal = function () {
        $log.log($rootScope);
    };
    $scope.pickDeveloper = function () {
        $rootScope.isDeveloper = true;
        $rootScope.isAnalyst = false;
        $rootScope.isSuper = false;
        $rootScope.theme.color = "green";
        $location.path("developer/datasets");
    }
    $scope.pickAnalyst = function () {
            $rootScope.isAnalyst = true;
            $rootScope.isDeveloper = false;
            $rootScope.isSuper = false;
            $rootScope.theme.color = "blue";
            $location.url("analyst/compare");
        }
        //validate the newUser object on changes
    $scope.$watch('newUser', function () {
        //check that passwords match
        if ($scope.newUser.password != $scope.newUser.passwordConfirm) $scope.passwordMismatch = true;
        else $scope.passwordMismatch = false;
        //check that a role was selected
        if ($scope.newUser.role == null) $scope.invalidRole = true;
        else $scope.invalidRole = false;
    }, true);
    //TODO
    $scope.login = function () {
            var input = {
                username: $scope.username
                , password: $scope.password
            }
            $log.debug(input);
            //authenticate against REST service
            userService.login($scope.username, $scope.password).then(
                //success
                function (response) {
                    if (response.status == 'Success') {
                        //analyst
                        if ($rootScope.user.role.roleID == 'ANALYST') {
                            $rootScope.isAnalyst = true;
                            $rootScope.isDeveloper = false;
                            $rootScope.isSuper = false;
                            $rootScope.theme.color = 'blue';
                            $location.url('analyst/compare');
                        }
                        //developer
                        else if ($rootScope.user.role.roleID == 'DEVELOPER') {
                            $rootScope.isDeveloper = true;
                            $rootScope.isAnalyst = false;
                            $rootScope.isSuper = false;
                            $rootScope.theme.color = 'green';
                            $location.url('developer/datasets');
                        }
                        //superuser
                        else {
                            $rootScope.isSuper = true;
                            $rootScope.isAnalyst = false;
                            $rootScope.isDeveloper = false;
                            $rootScope.theme.color = 'light-gray';
                            $location.url('developer/datasets'); //temporary until super user landing page created
                        }
                    }
                    //error
                    else {
                        $log.error(response.data);
                    }
                }, //error
                function (error) {
                    $log.error(error);
                    //TODO add unsuccessful login alert
                });
        }
        //TODO
    $scope.register = function () {
        var input = {
            username: $scope.newUser.username
            , password: $scope.newUser.password
            , role: {
                roleID: $scope.newUser.role
            }
        }
        $log.debug(input);
        //create new user with REST service
        userService.register(input).then(
            //successful account creation
            function (response) {
                if (response.status == 'Success') {
                    //use login() to authenticate
                    $scope.username = response.data.username;
                    $scope.password = response.data.password;
                    $scope.login();
                }
                //error
                else {
                    $log.error(response.data);
                }
            }, //error
            function (error) {
                $log.error(error);
                //TODO add unsuccessful account creation alert
            });
    }
});