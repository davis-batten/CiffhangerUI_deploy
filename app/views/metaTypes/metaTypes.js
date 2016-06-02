'use strict';

var module = angular.module('cliffhanger.metaTypes', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/datasets/metaTypes', {
        templateUrl: 'views/metaTypes/metaTypes.html',
        controller: 'MetaTypeCtrl'
    });
}]);

//main controller for /#/datasets/metaTypes
module.controller('MetaTypeCtrl', function ($scope, $uibModal, $log) {

    $scope.selected = undefined;
    $scope.noResults = false;

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    }

    //test data
    $scope.metaTypes = ['ZIP', 'Name', 'SSN', 'Country'].sort(ignoreCase);


    //opens addMetaModal
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

//controller for an instance of addMetaModal
datasets.controller('AddMetaModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {

    $scope.input = {};

    //complete modal
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
