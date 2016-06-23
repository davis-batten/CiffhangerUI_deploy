'use strict';

var queries = angular.module('cliffhanger.queries', ['ngRoute']);

queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets) {
    $scope.query = {};
    $scope.step = 1;
    $scope.datasets = datasets;
    $scope.tags = []; //TODO load based upon datasets
    $scope.addJoinColumn = false;

    /advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
    };

    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
    };

    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    //complete the modal
    $scope.submit = function () {
        //TODO
    };

});
