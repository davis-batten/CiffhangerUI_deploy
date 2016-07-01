'use strict';
var queries = angular.module('cliffhanger.queries', ['ngRoute', 'ngSanitize', 'ngCsv']);
queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets, queryService) {
    $scope.query = {}; //container for query
    $scope.alerts = [];
    $scope.tableResult = {};
    $scope.selected = {};
    $scope.step = 1; //which step in the modal is on
    $scope.maxSteps = 5; //number of steps in modal
    $scope.datasets = datasets;
    $scope.tags = []; //TODO load based upon datasets
    $scope.addJoinColumn = false; //whether to include joined column in select
    $scope.selectedDatasets = []; //datasets selected to be joined
    $scope.selectedTags = []; //selected join tags
    $scope.selectedColumns = []; //select columns for query
    //for save query dropdown
    $scope.isCollapsed = true;
    $scope.download = false;
    $scope.loadingPreview = false;
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
        //method responsible for handling changes due to checkboxes
        //d -> item selected/deselected
        //selections -> array to add/remove item
    $scope.changeColumns = function (column, selections, dataset) {
            if (column.selected) {
                column.db_table_name = dataset.db_table_name;
                selections.push(column);
            } else {
                for (var i = 0; i < selections.length; i++) {
                    $log.debug(selections[i]);
                    if (selections[i].name == column.name) {
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
        } else if ($scope.step == 4) $scope.buildQuery();
        else if ($scope.step == 5) {
            $scope.runQuery($scope.query);
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

    $scope.selectAllFromDataset = function (dataset) {
        if ($scope.selected[dataset.name]) {
            for (var i = 0; i < dataset.attributes.length; i++) {
                var a = dataset.attributes[i];
                a.selected = true;
            }
        } else {
            for (var i = 0; i < dataset.attributes.length; i++) {
                var a = dataset.attributes[i];
                a.selected = false;
            }
        }
    }


    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    //add where and limit clause to SQL query string
    $scope.addToQuery = function () {
        if (($scope.statement.where == null && $scope.statement.limit == null) || ($scope.statement.where == "" && $scope.statement.limit == "") || ($scope.statement.where == null && $scope.statement.limit == "") || ($scope.statement.where == "" && $scope.statement.limit == null)) {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = ";";
        }
        //adding both WHERE and LIMIT statement
        else if ($scope.statement.where != null && $scope.statement.limit != null) {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nWHERE " + $scope.statement.where + "\n" + "LIMIT " + $scope.statement.limit + ";";
        }
        //adding WHERE and not LIMIT
        else if (($scope.statement.where != null && $scope.statement.limit == null) || ($scope.statement.where != null && $scope.statement.limit == "")) {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nWHERE " + $scope.statement.where + ";";
        }
        //adding LIMIT and not WHERE
        else if (($scope.statement.where == null && $scope.statement.limit != null) || ($scope.statement.where == "" && $scope.statement.limit != null)) {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nLIMIT " + $scope.statement.limit + ";";
        }
        $log.debug($scope.statement);
    };
    //build a new query given the user's choices
    $scope.buildQuery = function () {
        //query input packaged
        var queryInput = {
            datasets: $scope.selectedDatasets,
            joinTag: $scope.selectedTags,
            addJoinColumn: $scope.addJoinColumn,
            columns: $scope.selectedColumns
        }
        queryService.buildQuery(queryInput).then(function (response) {
            //success callback
            if (response.status == 'Success') {
                $scope.query = response.data;
                $scope.progressType = 'success';
                //failure callback
            } else {
                $scope.progressType = 'danger';
                $scope.buildQueryError = true;
                $log.error(response.data);
            }
        });
    };
    //complete the modal
    $scope.save = function () {
        if ($scope.statement.text != null) {
            $scope.newQuery.sqlString = $scope.query + $scope.statement.text;
        } else {
            $scope.newQuery.sqlString = $scope.query;
        }
        queryService.saveQuery($scope.newQuery).then(function (data) {
            if (data.status == 'Success') {
                $log.debug(data);
            } else {
                $scope.alerts.push({
                    msg: data,
                    type: 'danger'
                });
            }
        }, function (data) {
            $scope.alerts.push({
                msg: 'Failed to create Query',
                type: 'danger'
            });
        })
    };
    $scope.runQuery = function () {
        $scope.loadingPreview = true;
        var query = $scope.query;
        queryService.runQuery(query).then(function (response) { //success callback
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
