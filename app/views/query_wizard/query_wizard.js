'use strict';
var query_wizard = angular.module('cliffhanger.query_wizard', ['ngRoute', 'ngSanitize', 'ngCsv']);
query_wizard.controller('QueryWizardCtrl', function ($scope, $rootScope, $uibModalInstance, $log, datasets, queryService) {
    $scope.query = {}; //container for query
    $scope.alerts = [];
    $scope.dataTypeCheck = [];
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
    $scope.showExit = false;
    $scope.download = false;
    $scope.loadingPreview = false;
    $scope.alreadyUsedDatasets = [];
    $scope.alreadyUsedTags = [];
    $scope.numJoins = 0;
    $scope.queryRanFine = true;
    $scope.connectionFailed = false;
    $scope.noResults = false;
    $scope.newProblemInput = {
        subject: '',
        message: '',
        username: $rootScope.user.username
    }
    $scope.shouldShowNotifyDevsForm = false;

    //method responsible for handling changes due to checkboxes
    //d -> item selected/deselected
    //selections -> array to add/remove item
    $scope.change = function (d, selections) {
        if (d.selected) {
            if (selections.indexOf(d) > -1) selections.push(angular.copy(d));
            else selections.push(d);
        } else {
            for (var i = 0; i < selections.length; i++) {
                $log.debug('remove?', selections[i]);
                if (selections[i].name == d.name) {
                    selections.splice(i, 1);
                }
            }
        }
        $log.debug('selected', selections);
    };
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
    };
    //load the joinable tags only in the selected datasets
    $scope.loadTags = function () {
        if ($scope.selectedDatasets[$scope.numJoins] != undefined) {
            $log.debug('tags in i', $scope.selectedDatasets[$scope.numJoins].tags);
            $log.debug('tags in (i -1)', $scope.selectedDatasets[$scope.numJoins - 1].tags);
            for (var i = 0; i < $scope.selectedDatasets[$scope.numJoins - 1].tags.length; i++) {
                var tagA = $scope.selectedDatasets[$scope.numJoins - 1].tags[i];
                for (var j = 0; j < $scope.selectedDatasets[$scope.numJoins].tags.length; j++) {
                    var tagB = $scope.selectedDatasets[$scope.numJoins].tags[j];
                    //if tags match, aren't EMPTY and are not a duplicate
                    if (tagA.name == tagB.name && tagA.name != '<EMPTY>' && $scope.tags.indexOf(tagA) == -1) {
                        $scope.tags.push(tagA);
                        break;
                    }
                }
            }
            $log.debug($scope.tags);
        } else $scope.tags = [];
    };
    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
        if ($scope.step == 2) {
            $scope.numJoins++;
            $log.debug($scope.numJoins);
        } else if ($scope.step == 3) {
            $scope.archiveTags();
        } else if ($scope.step == 4) {
            $scope.buildQuery();
        } else if ($scope.step == 5) {
            $scope.runQuery();
        }
    };
    
    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
        if ($scope.step == 1) {
            //deselect all datasets
            for (var i = 0; i < $scope.datasets.length; i++) {
                $scope.datasets[i].selected = false;
            }
            $scope.selectedDatasets = [];
            $scope.alreadyUsedDatasets = [];
            $scope.numJoins--;
            $scope.tags = [];
            $log.debug('datasets', $scope.datasets);
            $log.debug('selectedDatasets', $scope.selectedDatasets);
        }
        if ($scope.step < $scope.maxSteps) {
            $scope.progressType = null;
            $scope.tableResult = null;
        }
    };
    
    $scope.archiveDatasets = function () {
        for (var i = 0; i < $scope.selectedDatasets.length; i++) {
            if ($scope.alreadyUsedDatasets.indexOf($scope.selectedDatasets[i]) == -1) {
                $scope.alreadyUsedDatasets.push($scope.selectedDatasets[i]);
            }
        }
    };
    $scope.archiveTags = function () {
        for (var i = 0; i < $scope.selectedTags.length; i++) {
            $scope.alreadyUsedTags.push($scope.selectedTags[i]);
        }
        $log.debug('archivedTags', $scope.alreadyUsedTags);
    };
    $scope.selectAllFromDataset = function (dataset) {
        for (var i = 0; i < dataset.attributes.length; i++) {
            var a = dataset.attributes[i];
            //select all
            if ($scope.selected[dataset.name]) {
                //add column to selection
                a.db_table_name = dataset.db_table_name;
                a.selected = true;
                $scope.selectedColumns.push(a);
            }
            //deselect all
            else {
                a.selected = false;
                //remove column from selection
                for (var j = 0; j < $scope.selectedColumns.length; j++) {
                    if ($scope.selectedColumns[j].name == a.name) {
                        $scope.selectedColumns.splice(j, 1);
                    }
                }
            }
        }
    };
    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    //add where and limit clause to SQL query string
    $scope.addToQuery = function () {
        if (($scope.statement.where == undefined && $scope.statement.limit == undefined) || ($scope.statement.where == "" && $scope.statement.limit == "") || ($scope.statement.where == undefined && $scope.statement.limit == "") || ($scope.statement.where == "" && $scope.statement.limit == undefined)) {
            $scope.statement.text = "";
        }
        //adding both WHERE and LIMIT statement
        else if (($scope.statement.where != undefined && $scope.statement.limit != undefined && $scope.statement.where != "" && $scope.statement.limit != "")) {
            $scope.statement.text = "\nWHERE " + $scope.statement.where + "\n" + "LIMIT " + $scope.statement.limit;
        }
        //adding WHERE and not LIMIT
        else if (($scope.statement.where != undefined && $scope.statement.limit == undefined) || ($scope.statement.where != undefined && $scope.statement.limit == "")) {
            $scope.statement.text = "\nWHERE " + $scope.statement.where;
        }
        //adding LIMIT and not WHERE
        else if (($scope.statement.where == undefined && $scope.statement.limit != undefined) || ($scope.statement.where == "" && $scope.statement.limit != null)) {
            $scope.statement.text = "\nLIMIT " + $scope.statement.limit;
        }
        $log.debug($scope.statement);
    };

    //build a new query given the user's choices
    $scope.buildQuery = function () {
        //query input packaged
        var queryInput = {
            datasets: $scope.selectedDatasets,
            joinTag: $scope.alreadyUsedTags,
            addJoinColumn: true,
            columns: $scope.selectedColumns
        }

        queryService.buildQuery(queryInput).then(function (response) {
            //success callback
            if (response.status == 'Success') {
                $scope.query = response.data;
                $scope.progressType = 'success';
                $log.debug('response', response);
                if ($scope.query[1] == true) {
                    $scope.dataTypeCheck.push({
                        msg: "Join Attributes data type mismatch.",
                        type: 'warning'
                    });
                }
            } else { //failure callback
                $scope.progressType = 'danger';
                $scope.buildQueryError = true;
                $log.error(response.data);
            }
        });

    };

    //complete the modal
    $scope.save = function () {
        if ($scope.statement != undefined) {
            $scope.newQuery.sqlString = $scope.query[0] + $scope.statement.text;
        } else {
            $scope.newQuery.sqlString = $scope.query[0];
        }
        if ($scope.newQuery.description == null || $scope.newQuery.description == undefined) {
            $scope.newQuery.description = "";
        }
        queryService.saveQuery($scope.newQuery).then(function (data) {
            if (data.status == 'Success') {
                $scope.alerts.push({
                    msg: "Query Successfully Saved!",
                    type: 'success'
                });
                $scope.showExit = true;
                $log.debug(data);
            } else {
                $scope.alerts.push({
                    msg: "Save Failed",
                    type: 'danger'
                });
                $log.debug(data);
            }
            $log.debug($scope.statement);
        });
    };
    
    $scope.runQuery = function () {
        $scope.loadingPreview = true;
        if ($scope.statement != undefined) {
            var query = $scope.query[0] + $scope.statement.text;
        } else {
            var query = $scope.query[0];
        }
        queryService.runQuery(query).then(function (response) { //success callback
                $scope.loadingPreview = false;
                if ($scope.tableResult.rows == undefined || $scope.tableResult.rows.length == 0) {
                    // no results
                    $scope.progressType = 'danger';
                    $scope.queryRanFine = false;
                    $scope.noResults = true;
                    $scope.newProblemInput.message = "Cliffhanger Report: Running the join query succeeded but the result table was empty. \nQuery used: "+query;
                } else {
                    $scope.tableResult = response;
                    $scope.progressType = 'success';
                } 

            }, //failure to connect
            function (data) {
                $scope.loadingPreview = false;
                $scope.progressType = 'danger';
                $scope.queryRanFine = false;
                $scope.connectionFailed = true;
                $scope.newProblemInput.message = "Cliffhanger Report: HTTP call during method runQuery() in QueryService.js was not status 200. There is likely a problem with the REST service or Hive. \nQuery used: "+ query;

                $log.error('Failed to connect to server');
            });
    };
    
    $scope.$watch('selectedDatasets', function () {
        if ($scope.step == 2) {
            $log.debug("load tags");
            $scope.loadTags();
        }
    }, true);
    $scope.addAnotherJoin = function () {
        $log.debug('add another join');
        $scope.archiveDatasets();
        $scope.archiveTags();
        for (var i = 0; i < $scope.datasets.length; i++) {
            $scope.datasets[i].selected = false;
        }
        $scope.selectedTags = [];
        $scope.tags = [];
        $scope.numJoins++;
        $log.debug('dataset', $scope.selectedDatasets);
    };

    $scope.showNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = true;
    };
    
    $scope.hideNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = false;
    };
    
    $scope.reportProblem = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
});
