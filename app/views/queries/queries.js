'use strict';
angular.module('cliffhanger.queries', ['ngRoute', 'ngSanitize', 'ngCsv']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/queries', {
        templateUrl: 'views/queries/queries.html'
        , controller: 'QueriesCtrl'
    });
}]);
var queries = angular.module('cliffhanger.queries');
//main controller for queries page
queries.controller('QueriesCtrl', function ($scope, $uibModal, $log, queryService) {
    $scope.selected = [];
    $scope.showNoQueriesMessage = false;
    $scope.download = false;
    $scope.alerts = []; //list of alerts to show to user
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //alphabetically compare two strings, ignoring case
    /*var ignoreCase = function (a, b) {
        return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
    };
    */
    //for sort by
    $scope.toggleDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.isopen = !$scope.status.isopen;
    };
    $scope.setSort = function (sort) {
        $scope.propertyName = sort;
    };
    $scope.getAllQueries = function () {
        queryService.getAllQueries().then(function (data) {
            $log.debug('response', data);
            if (data.status == 'Success') {
                $log.debug('data obj', data.data);
                $scope.queries = eval(data.data);
                /*
                if ($scope.queries.length > 1) {
                    $scope.queries = data.data.sort(ignoreCase);
                }
                */
            }
            else {
                $scope.queries = [];
            }
        })
    };
    $scope.getAllQueries();
    //opens view modal
    $scope.view = function (q) {
        var modalInstance = $uibModal.open({
            templateUrl: 'viewQueryModalContent.html'
            , controller: 'ViewQueryModalInstanceCtrl'
            , size: 'lg'
            , resolve: {
                query: function () {
                    return q;
                }
            }
        });
    }
});
//controller for an instance of ViewQueryModal
datasets.controller('ViewQueryModalInstanceCtrl', function ($scope, $uibModalInstance, $log, query, queryService) {
    $scope.query = query;
    $scope.step = 1; //what step is the modal on
    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            $scope.runQuery($scope.query);
        }
    };
    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
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
                $log.error('Failed to connect to server');
            });
    };
});