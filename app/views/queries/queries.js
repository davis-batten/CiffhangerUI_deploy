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
        $scope.reverse = false;
        if (sort == 'dateCreatedReverse') {
            $scope.propertyName = 'dateCreated';
            $scope.reverse = true;
        }
    };

    $scope.getQueries = function () {
        if ($rootScope.user.roles[0] == 'ROLE_ADMIN') {
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
            } else {
                $scope.queryList = [];
            }
        })
}
$scope.getAllQueries();
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
    modalInstance.result.then(function (q) {
        $log.warn('Deleted', q);
        queryService.deleteQuery(q).then(function (response) {
            for (i in $scope.queryList) {
                if (q.name == $scope.queryList[i].name) {
                    $scope.queryList.splice(i, 1)
                    $scope.alerts.push({
                        msg: "Query deleted",
                        type: 'success'
                    })
                }
            }
        }, function (response) {
            $scope.alerts.push({
                msg: 'Problem communicating',
                type: 'danger'
            })
            $log.log($scope.data)
        });
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
