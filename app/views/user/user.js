angular.module('cliffhanger.superuser', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/superuser/users', {
        templateUrl: 'views/user/user.html',
        controller: 'UsersCtrl'
    });
}]);
var users = angular.module('cliffhanger.superuser');
//main controller for users page
users.controller('UsersCtrl', function ($scope, $uibModal, $log, userService, $rootScope) {
            $scope.showNoUsersMessage = false;
            $scope.alerts = []; //list of alerts to show to user
            //closes an alert
            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };
            //set theme color
            $rootScope.theme.color = 'light-gray';
            //for logout dropdown
            $scope.toggleLogoutDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.logoutisopen = !$scope.status.logoutisopen;
            };

            $scope.getAllUsers = function () {
                userService.getAllUsers().then(function (data) {
                    $log.debug('response', data);
                    if (data.status == 'Success') {
                        $log.debug('data obj', data.data);
                        $scope.userList = eval(data.data);
                    } else {
                        $scope.userList = [];
                    }
                })
            };
            $scope.getAllUsers();

            //opens update user modal for user u
            $scope.updateUser = function (u) {
                $log.log(u);
                var nameTemp = u.username;
                var modalInstance = $uibModal.open({
                    templateUrl: 'userUpdate.html',
                    controller: 'UpdateUserModalCtrl',
                    size: 'lg',
                    resolve: {
                        dataset: function () {
                            return u;
                        }
                    }
                });
                //executes changes (or carries unchanged values through)
                modalInstance.result.then(function (u) {
                    if (u.username == "") {
                        $scope.alerts.push({
                            msg: 'Cannot update username to empty value',
                            type: 'danger'
                        });
                    } else {
                        userService.updateUser(nameTemp, u).then(
                            //success callback
                            function (resp) {
                                if (resp.status == 'Success') {
                                    for (i in $scope.userList) {
                                        if (nameTemp == $scope.userList[i].username) {
                                            $scope.userList[i] = resp.data;
                                        }
                                    }
                                }
                                //problem on backend
                                else {
                                    $log.warn("Failed to update");
                                    $scope.alerts.push({
                                        msg: 'Failed to update user on backend',
                                        type: 'danger'
                                    });
                                }
                            }, //error callback
                            function () {
                                $log.error("Failed to connect");
                                $scope.alerts.push({
                                    msg: 'Failed to connect',
                                    type: 'danger'
                                });
                            });
                    }
                });
            };


            //controller for an instance of ViewQueryModal
            users.controller('UpdateUserModalCtrl', function ($scope, $uibModalInstance, $log, user, userService) {
                $scope.user = user;
                //gets input from user
                $scope.input = {
                    username: user.username,
                    password: user.password,
                    role: user.role
                };
                //complete modal
                $scope.complete = function () {
                    $uibModalInstance.close($scope.input);
                };
                //dismiss modal
                $scope.cancel = function () {
                    $uibModalInstance.dismiss('cancel');
                };
                //run the query
                $scope.updateUser = function () {
                    var newUser = $scope.user;
                    userService.updateUser(newUser).then(function (response) {
                            $scope.tableResult = response;
                            $scope.progressType = 'success';
                        }, //failure to connect
                        function (data) {
                            $scope.alerts.push({
                                msg: "Update User Failed",
                                type: 'danger'
                            });
                            $log.error('Failed to connect to server');
                        });
                };
            });
