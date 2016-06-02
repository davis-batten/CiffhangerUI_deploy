'use strict';

var module = angular.module('cliffhanger.metaTypes', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/datasets/metaTypes', {
        templateUrl: 'views/metaTypes/metaTypes.html',
        controller: 'MetaTypeCtrl'
    });
}]);

module.controller('MetaTypeCtrl', function ($scope, $uibModal, $log) {

    $scope.selected = undefined;
    $scope.noResults = false;

    var ignoreCase = function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    $scope.metaTypes = ['ZIP', 'Name', 'SSN', 'Country'].sort(ignoreCase);



    $scope.add = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addMetaModalContent.html',
            controller: 'AddMetaModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);

            //TODO for testing only!!
            $scope.metaTypes.push(input.name);
            $scope.metaTypes.sort(ignoreCase);
        });
    };




});

datasets.controller('AddMetaModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {

    $scope.input = {};


    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
