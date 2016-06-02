'use strict';

var module = angular.module('cliffhanger.attributes', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/datasets/attributes', {
        templateUrl: 'views/attributes/attributes.html',
        controller: 'AttributesCtrl'
    });
}]);

module.controller('AttributesCtrl', function ($scope, $uibModal, $log) {

    $scope.selected = undefined;
    $scope.noResults = false;

    $scope.attributes = ['ZIP', 'Name', 'SSN', 'Country'].sort(ignoreCase);

    var ignoreCase = function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    $scope.add = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addAttrModalContent.html',
            controller: 'AddAttrModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);

            //TODO for testing only!!
            $scope.attributes.push(input.name);
            $scope.attributes.sort(ignoreCase);
        });
    };




});

datasets.controller('AddAttrModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {

    $scope.input = {};


    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
