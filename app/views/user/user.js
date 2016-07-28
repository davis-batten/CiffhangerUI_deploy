angular.module('cliffhanger.superuser', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/superuser/users', {
        templateUrl: 'views/user/user.html'
        , controller: 'UsersCtrl'
        , activetab: 'users'
    });
}]);
var users = angular.module('cliffhanger.superuser');
//main controller for users page
users.controller('UsersCtrl', function ($scope, $uibModal, $log, $location, userService, $rootScope) {
    $scope.showNoUsersMessage = false;
    $scope.alerts = []; //list of alerts to show to user
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //set theme color
    $rootScope.theme.color = 'light-gray';
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;
    //for logout dropdown
    $scope.toggleLogoutDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.logoutisopen = !$scope.status.logoutisopen;
    };
    //for filter dropdown
    $scope.toggleFilterDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.filterbyisopen = !$scope.status.filterbyisopen;
    };
    //for filter
    $scope.setFilter = function (userRole) {
        if (userRole != null) {
            $scope.query = {
                role: {
                    roleID: userRole
                }
            };
        }
        else $scope.query = '';
    }
    $scope.getAllUsers = function () {
        userService.getAllUsers().then(function (data) {
            $log.debug('response', data);
            if (data.status == 'Success') {
                $log.debug('data obj', data.data);
                $scope.userList = eval(data.data);
            }
            else {
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
            templateUrl: 'userUpdate.html'
            , controller: 'UpdateUserModalCtrl'
            , size: 'lg'
            , resolve: {
                user: function () {
                    return u;
                }
            }
        });
        //executes changes (or carries unchanged values through)
        modalInstance.result.then(function (input) {
            if (input.username == "") {
                $scope.alerts.push({
                    msg: 'Cannot update username to empty value'
                    , type: 'danger'
                });
            }
            else {
                userService.updateUser(nameTemp, input).then(
                    //success callback
                    function (resp) {
                        if (resp.status == 'Success') {
                            for (i in $scope.userList) {
                                if (nameTemp == $scope.userList[i].username) {
                                    $scope.userList[i].username = input.username;
                                    $scope.userList[i].password = input.password;
                                    $scope.userList[i].role = input.role;
                                }
                            }
                        }
                        //problem on backend
                        else {
                            $log.warn("Failed to update");
                            $scope.alerts.push({
                                msg: 'Failed to update user on backend'
                                , type: 'danger'
                            });
                        }
                    }, //error callback
                    function () {
                        $log.error("Failed to connect");
                        $scope.alerts.push({
                            msg: 'Failed to connect'
                            , type: 'danger'
                        });
                    });
            }
        });
    };
    $scope.deleteUser = function (u) {
        $log.warn('delete', u);
        var modalInstance = $uibModal.open({
            templateUrl: 'userDelete.html'
            , controller: 'UserDeleteModalCtrl'
            , size: 'md'
            , resolve: {
                user: function () {
                    return u;
                }
            }
        });
        //on modal completion
        modalInstance.result.then(function (u) {
            $log.warn('Deleted', u);
            userService.deleteUser(u.username).then(function (response) {
                for (i in $scope.userList) {
                    if (u.username == $scope.userList[i].username) {
                        $scope.userList.splice(i, 1)
                    }
                }
            })
        }, function (response) {
            $scope.alerts.push({
                msg: 'Problem communicating'
                , type: 'danger'
            })
            $log.error('Failure')
        });
    };
});
//controller for an instance of UpdateUserModal
users.controller('UpdateUserModalCtrl', function ($scope, $uibModalInstance, $log, user) {
    $scope.user = user;
    //gets input from user
    $scope.input = {
        username: user.username
        , password: user.password
        , role: {
            roleID: $scope.user.role
        }
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