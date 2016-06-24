'use strict';

var queries = angular.module('cliffhanger.query_wizard', ['ngRoute']);

queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets) {
    $scope.query = {}; //container for query
    $scope.step = 1; //which step in the modal is on
    $scope.maxSteps = 4; //number of steps in modal
    $scope.datasets = datasets;
    $scope.tags = []; //TODO load based upon datasets



    $scope.addJoinColumn = false; //whether to include joined column in select
    $scope.selectedDatasets = []; //datasets selected to be joined
    $scope.selectedTags = []; //selected join tags
    $scope.selectedColumns = []; //select columns for query

    //method responsible for handling changes due to checkboxes
    //d -> item selected/deselected
    //selections -> array to add/remove item
    $scope.change = function (d, selections) {
        if (d.selected) {
            selections.push(d);
        } else {
            for (var i = 0; i < selections.length; i++) {
                $log.debug(selections[i]);
                if (selections[i].name == d.name) {
                    selections.splice(i, 1);
                }
            }
        }
        $log.debug(selections);
    }

    //load the joinable tags only in the selected datasets
    $scope.loadTags = function () {
        for (var i = 0; i < $scope.selectedDatasets[0].tags.length; i++) {
            var tagA = $scope.selectedDatasets[0].tags[i];
            for (var j = 0; j < $scope.selectedDatasets[1].tags.length; j++) {
                var tagB = $scope.selectedDatasets[1].tags[j];
                //if tags match, aren't EMPTY and are not a duplicate
                if (tagA.name == tagB.name && tagA.name != '<EMPTY>' && $scope.tags.indexOf(tagA) == -1) {
                    $scope.tags.push(tagA);
                    break;
                }
            }
        }
        $log.debug($scope.tags);
    }


    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            $scope.loadTags();
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