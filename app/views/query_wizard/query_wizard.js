'use strict';

var queries = angular.module('cliffhanger.query_wizard', ['ngRoute']);

queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets) {
    $scope.query = {};
    $scope.step = 1;
    $scope.maxSteps = 4;
    $scope.datasets = datasets;
    $scope.tags = []; //TODO load based upon datasets



    $scope.addJoinColumn = false;
    $scope.selectedDatasets = [];
    $scope.selectedTags = [];
    $scope.selectedColumns = [];

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




    //    //load the joinable tags only in the selected datasets
    //    $scope.loadTags = function () {
    //        for (var d = 0; d < datasets.length; d++) {
    //            if ($scope.datasets[d].selected) {
    //                $log.debug($scope.datasets[d].name + ' was selected');
    //                for (var t = 0; t < datasets[d].tags.length; t++) {
    //                    var tag = $scope.datasets[d].tags[t];
    //                    $log.debug(tag);
    //                    //don't add duplicates or <empty>
    //                    if ($scope.tags.map(function (e) {
    //                            return e.name;
    //                        }).indexOf(tag.name) == -1 && tag.name != '<EMPTY>') {
    //                        $scope.tags.push(tag);
    //                    }
    //                }
    //            }
    //        }
    //        $log.debug($scope.tags);
    //    }

    //load the joinable tags only in the selected datasets
    $scope.loadTags = function () {
        for (var i = 0; i < $scope.selectedDatasets[0].tags.length; i++) {
            var tagA = $scope.selectedDatasets[0].tags[i];
            for (var j = 0; j < $scope.selectedDatasets[1].tags.length; j++) {
                var tagB = $scope.selectedDatasets[1].tags[j];
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
