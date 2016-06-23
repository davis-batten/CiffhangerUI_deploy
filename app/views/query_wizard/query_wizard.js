'use strict';

var queries = angular.module('cliffhanger.query_wizard', ['ngRoute']);

queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets) {
    $scope.query = {};
    $scope.step = 1;
    $scope.maxSteps = 5;
    $scope.datasets = datasets;
    $scope.tags = []; //TODO load based upon datasets
    $scope.addJoinColumn = false;

    $scope.selectedCount = datasets.length;

    // Count the number of selected items
    $scope.change = function (item) {
        if (item.selected) {
            $scope.selectedCount++
        } else {
            $scope.selectedCount--
        }
        $log.debug($scope.selectedCount);
    };

    //load the tags only in the selected datasets
    var loadTags = function () {
        for (var d = 0; d < datasets.length; d++) {
            if ($scope.datasets[d].selected) {
                $log.debug($scope.datasets[d].name + ' was selected');
                for (var t = 0; t < datasets[d].tags.length; t++) {
                    var tag = $scope.datasets[d].tags[t];
                    $log.debug(tag);
                    //don't add duplicates or <empty>
                    if ($scope.tags.map(function (e) {
                            return e.name;
                        }).indexOf(tag.name) == -1 && tag.name != '<EMPTY>') {
                        $scope.tags.push(tag);
                    }
                }
            }
        }
        $scope.selectedCount = $scope.tags.length; //so you can check how many are selected
        $log.debug($scope.tags);
    }

    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            loadTags();
        } else if ($scope.step == $scope.maxSteps) $scope.progressType = "success";
    };

    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
        if ($scope.step < $scope.maxSteps) $scope.progressType = null;
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
