/*
angular.module('cliffhanger.queries', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
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

    $scope.alerts = []; //list of alerts to show to user

    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
    }

    $scope.getAllQueries = function () {
        queryService.getAllQueries()
            .then(function (data) {
                $log.debug('response', data);
                if (data.status == 'Success') {
                    $log.debug('data obj', data.data);
                    $scope.queries = data.data.sort(ignoreCase);
                } else {
                    $scope.queries = [];
                }
            })
    };
    $scope.getAllQueries();

    $scope.view = function (q) {
        var modalInstance = $uibModal.open({
            templateUrl: 'viewQueryModalContent.html'
            , controller: 'ViewQueryModalInstanceCtrl'
            , size: 'lg'
        });

    }
});
*/
