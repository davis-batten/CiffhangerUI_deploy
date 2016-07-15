angular.module('cliffhanger.queries', ['ngRoute', 'ngSanitize', 'ngCsv']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/queries', {
        templateUrl: 'views/queries/queries.html',
        controller: 'QueriesCtrl',
        activetab: 'queries'
    });
}]);
var queries = angular.module('cliffhanger.queries');
//main controller for queries page
queries.controller('QueriesCtrl', function ($scope, $uibModal, $log, queryService, $rootScope) {
    $scope.selected = [];
    $scope.showNoQueriesMessage = false;
    $scope.download = false;
    //queries sorted by date created by default
    $scope.propertyName = 'dateCreated';
    $scope.alerts = []; //list of alerts to show to user
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //set theme color
    $rootScope.theme.color = 'blue';
    //for logout dropdown
    $scope.toggleLogoutDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.logoutisopen = !$scope.status.logoutisopen;
    };
    //for sort by dropdown
    $scope.toggleSortByDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.sortbyisopen = !$scope.status.sortbyisopen;
    };
    $scope.setSort = function (sort) {
        $scope.propertyName = sort;
    };

    $scope.getQueries = function () {
        if ($rootScope.user.role.roleID == 'ANALYST') {
            $scope.getUserQueries = function () {
                queryService.getUserQueries().then(function (data) {
                    $log.debug('response', data);
                    if (data.status == 'Success') {
                        $log.debug('data obj', data.data);
                        $scope.queryList = eval(data.data);
                    } else {
                        $scope.queryList = [];
                    }
                })
            }
            $scope.getUserQueries();
        } else {
            $scope.getAllQueries = function () {
                queryService.getAllQueries().then(function (data) {
                    $log.debug('response', data);
                    if (data.status == 'Success') {
                        $log.debug('data obj', data.data);
                        $scope.queryList = eval(data.data);
                    } else {
                        $scope.queryList = [];
                    }
                })
            };
            $scope.getAllQueries();

        }
    }
    $scope.getQueries();

    //opens view modal
    $scope.view = function (q) {
        var modalInstance = $uibModal.open({
            templateUrl: 'viewQueryModalContent.html',
            controller: 'ViewQueryModalInstanceCtrl',
            size: 'lg',
            resolve: {
                query: function () {
                    return q;
                }
            }
        });
    };
    //opens deleteQuery modal for query q
    $scope.deleteQuery = function (q) {
        $log.log(q);
        var user = $rootScope.user;
        var modalInstance = $uibModal.open({
            templateUrl: 'queryDelete.html',
            controller: 'QueryDeleteModalCtrl',
            size: 'md',
            resolve: {
                query: function () {
                    return q;
                }
            }
        });
        //on modal completion
        modalInstance.result.then(function (q, user) {
            $log.warn('Deleted', q);
            $scope.showProgressBar = true;
            for (i in $scope.queryList) {
                if (q.name == $scope.queryList[i].name) {
                    queryService.deleteQuery(q, user).then(function (res) {
                        $scope.showProgressBar = false;
                        if (res.status == 'Success') {
                            $scope.queryList.splice(i, 1);
                            if ($scope.queryList.length == 0) $scope.showNoQueriesMessage = true;
                        } else {
                            $scope.alerts.push({
                                msg: res,
                                type: 'danger'
                            });
                        }
                    }, function (res) {
                        $scope.showProgressBar = false;
                        $scope.alerts.push({
                            msg: "Problem communicating with server!",
                            type: 'danger'
                        });
                    });
                }
            }
            $log.log($scope.data);
        });
    };
});
//controller for an instance of ViewQueryModal
queries.controller('ViewQueryModalInstanceCtrl', function ($scope, $uibModalInstance, $log, query, queryService) {
    $scope.query = query;
    $scope.maxSteps = 2;
    $scope.tableResult = {};
    $scope.step = 1; //what step is the modal on
    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            $scope.runQuery();
        }
    };
    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
        if ($scope.step < $scope.maxSteps) {
            $scope.progressType = null;
            $scope.tableResult = null;
        }
    };
    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    //run the query
    $scope.runQuery = function () {
        $scope.loadingPreview = true;
        var querySQL = $scope.query.sqlString;
        queryService.runQuery(querySQL).then(function (response) { //success callback
                $scope.loadingPreview = false;
                $scope.tableResult = response;
                $scope.progressType = 'success';
            }, //failure to connect
            function (data) {
                $scope.loadingPreview = false;
                $scope.progressType = 'danger';
                $scope.runQueryError = true;
                $scope.alerts.push({
                    msg: "Run Query Failed",
                    type: 'danger'
                });
                $log.error('Failed to connect to server');
            });
    };
});
//controller for instance of QueryDeleteModal
queries.controller('QueryDeleteModalCtrl', function ($scope, $uibModalInstance, $log, query) {
    $scope.query = query;
    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(query);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});