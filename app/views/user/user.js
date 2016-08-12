angular.module('cliffhanger.superuser', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/superuser/users', {
        templateUrl: 'views/user/user.html',
        controller: 'UsersCtrl',
        activetab: 'users'
    });
}]);
var users = angular.module('cliffhanger.superuser');
//main controller for users page
users.controller('UsersCtrl', function ($scope, $uibModal, $log, $location, userService, $rootScope) {
    //list of alerts to show to user
    $scope.alerts = [];
    //set theme color
    $rootScope.theme.color = 'light-gray';
    //
    $scope.isCollapsed = true;
    //
    $scope.showNoUsersMessage = false;
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    //reroutes to login if an unknown user
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    //for logout dropdown
    $scope.toggleLogoutDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.logoutisopen = !$scope.status.logoutisopen;
    };

    //for filter dropdown
    $scope.toggleFilterDropdown = function ($event) {
        $log.log("roles: ", $scope.query.roles)
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.filterbyisopen = !$scope.status.filterbyisopen;
    };

    //for filter
    $scope.setFilter = function (userRole) {
        if (userRole != null) {
            $scope.query = {
                roles: {
                    authority: userRole
                }
            };
        } else $scope.query = '';
    }

    //gets all users
    $scope.getAllUsers = function () {
        userService.getAllUsers().then(
            //success
            function (response) {
                $scope.userList = eval(response);
            },
            //error
            function (error) {
                $scope.userList = [];
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            });
    };
    $scope.getAllUsers();


    //opens update user modal for user u
    $scope.updateUser = function (u) {
        $log.log(u);
        var nameTemp = u.username;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/user/modals/userUpdate.html',
            controller: 'UpdateUserModalCtrl',
            size: 'lg',
            resolve: {
                user: function () {
                    return u;
                }
            }
        });
        //executes changes (or carries unchanged values through)
        modalInstance.result.then(function (input) {
            if (input.username == "") {
                $scope.alerts.push({
                    msg: 'Cannot update username to empty value',
                    type: 'danger'
                });
            } else {
                if (!input.password) input.password = "";
                userService.updateUser(nameTemp, input).then(
                    //success callback
                    function (resp) {
                        var updatedUser = resp;
                        for (i in $scope.userList) {
                            if (nameTemp == $scope.userList[i].username) {
                                $scope.userList[i].username = updatedUser.username;
                                //$scope.userList[i].password = updatedUser.password;
                                $scope.userList[i].hiveUser = updatedUser.hiveUser;
                                $scope.userList[i].hivePassword = updatedUser.hivePassword;
                                //$scope.userList[i].role = updatedUser.roles[0].authority;
                            }
                        }

                    }, //error callback
                    function (error) {
                        $scope.alerts.push({
                            msg: error.message,
                            type: 'danger'
                        });
                    });
            }
        });
    };

    //deletes a user
    $scope.deleteUser = function (u) {
        $log.warn('delete', u);
        var modalInstance = $uibModal.open({
            templateUrl: 'views/user/modals/userDelete.html',
            controller: 'UserDeleteModalCtrl',
            size: 'md',
            resolve: {
                user: function () {
                    return u;
                }
            }
        });
        //on modal completion
        modalInstance.result.then(function (u) {
            $log.warn('Deleted', u);
            userService.deleteUser(u.username).then(
                function (response) {
                    for (i in $scope.userList) {
                        if (u.username == $scope.userList[i].username) {
                            $scope.userList.splice(i, 1)
                        }
                    }
                },
                //error
                function (error) {
                    $scope.alerts.push({
                        msg: error.msg,
                        type: 'danger'
                    })
                });
        });
    }
});

//controller for an instance of UpdateUserModal
users.controller('UpdateUserModalCtrl', function ($scope, $uibModalInstance, $log, user) {
    $scope.user = user;
    //gets input from user
    $scope.input = {
        username: user.username,
        password: user.password,
        hiveUser: user.hiveUser,
        hivePassword: user.hivePassword
    };
    //complete modal
    $scope.complete = function () {
        $uibModalInstance.close($scope.input);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

//controller for instance of UserDeleteModal
users.controller('UserDeleteModalCtrl', function ($scope, $uibModalInstance, $log, user) {
    $scope.user = user;
    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(user);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
