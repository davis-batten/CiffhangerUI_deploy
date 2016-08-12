'use strict';
var query_wizard = angular.module('cliffhanger.query_wizard', ['ngRoute', 'ngSanitize', 'ngCsv']);
query_wizard.controller('QueryWizardCtrl', function ($scope, $rootScope, $uibModalInstance, $log, datasets, queryService, issueService) {
    //container for query
    $scope.query = {};
    //list of alerts
    $scope.alerts = [];
    //
    $scope.dataTypeCheck = [];
    //container for list results
    $scope.tableResult = {};
    //array of selected items from each page of the modal
    $scope.selected = {};
    //TODO load based upon datasets
    $scope.tags = [];
    //datasets selected to be joined
    $scope.selectedDatasets = [];
    //selected join tags
    $scope.selectedTags = [];
    //select columns for query
    $scope.selectedColumns = [];
    //
    $scope.alreadyUsedDatasets = [];
    //
    $scope.alreadyUsedTags = [];
    //which step in the modal is on
    $scope.step = 1;
    //number of steps in modal
    $scope.maxSteps = 5;
    //initialize number of joins for each query
    $scope.numJoins = 0;
    //
    $scope.datasets = datasets;
    //
    $scope.postReportSubmissionMessage = "";
    //whether to include joined column in select
    $scope.addJoinColumn = false;
    //
    $scope.contentToShow = 'QUERY_WIZARD_DEFAULT';

    //
    $scope.shouldShowNotifyDevsForm = false;

    // Stores the where condition for the query being built
    $scope.queryWhereCondition = "";

    // Stores the max number of results for the query being built
    $scope.queryResultsLimit = "";

    //
    $scope.newProblemInput = {
        subject: '',
        body: ''
    }


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

    // On click: X in <uib-alert> element
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
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
            $scope.contentToShow = 'QUERY_WIZARD_DEFAULT';
            $scope.loadingPreview = false;
            $scope.queryRanFine = true;
            $scope.connectionFailed = false;
            $scope.noResults = false;
            $scope.runNewQuery();
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

    //saves selected datasets and already used datasets for next page
    $scope.archiveDatasets = function () {
        for (var i = 0; i < $scope.selectedDatasets.length; i++) {
            if ($scope.alreadyUsedDatasets.indexOf($scope.selectedDatasets[i]) == -1) {
                $scope.alreadyUsedDatasets.push($scope.selectedDatasets[i]);
            }
        }
    };

    //saves selected tags and already used tags for next page
    $scope.archiveTags = function () {
        for (var i = 0; i < $scope.selectedTags.length; i++) {
            $scope.alreadyUsedTags.push($scope.selectedTags[i]);
        }
        $log.debug('archivedTags', $scope.alreadyUsedTags);
    };

    //starts another join page on modal instead of next step
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

    //select all info from a dataset
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

    //build a new query given the user's choices
    $scope.buildQuery = function () {
        //query input packaged
        var queryInput = {
            datasets: $scope.selectedDatasets,
            joinTag: $scope.alreadyUsedTags,
            addJoinColumn: true,
            columns: $scope.selectedColumns
        }
        queryService.buildQuery(queryInput).then(
            //success callback
            function (response) {
                $scope.query = response;
                $scope.progressType = 'success';
                $log.debug('response', response);
                if ($scope.query[1] == true) {
                    $scope.dataTypeCheck.push({
                        msg: "Join Attributes data type mismatch.",
                        type: 'warning'
                    });
                }
            },
            //error callback
            function (error) {
                $scope.progressType = 'danger';
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                })
            });
    };

    //complete the modal
    $scope.save = function () {
        $scope.newQuery.sqlString = $scope.query[0];
        if ($scope.queryWhereCondition.length > 0) {
            $scope.newQuery.sqlString += "\n" + "WHERE " + $scope.queryWhereCondition;
        }
        if ($scope.queryResultsLimit.length > 0) {
            $scope.newQuery.sqlString += "\n" + "LIMIT " + $scope.queryResultsLimit;
        }

        if ($scope.newQuery.description == null || $scope.newQuery.description == undefined) {
            $scope.newQuery.description = "";
        }
        queryService.saveQuery($scope.newQuery).then(
            //success
            function (data) {
                $scope.alerts.push({
                    msg: "Query Successfully Saved!",
                    type: 'success'
                });
                $log.debug(data);
            },
            //error
            function (error) {
                $scope.alerts.push({
                    msg: "Save Failed",
                    type: 'danger'
                });
                $log.debug(data);

            });
        $scope.contentToShow = 'QUERY_WIZARD_DEFAULT';
    };

    //sends new query to hive
    $scope.runNewQuery = function () {
        $scope.loadingPreview = true;
        var query = $scope.query[0];
        if ($scope.queryWhereCondition.length > 0) {
            query += "\n" + "WHERE " + $scope.queryWhereCondition;
        }
        if ($scope.queryResultsLimit.length > 0) {
            query += "\n" + "LIMIT " + $scope.queryResultsLimit;
        }
        queryService.runQuery(query).then(
            //success
            function (response) { //success callback
                $scope.loadingPreview = false;
                if (response.rows == undefined || response.rows.length == 0) {
                    // no results
                    $scope.progressType = 'danger';
                    $scope.queryRanFine = false;
                    $scope.noResults = true;
                    $scope.newProblemInput.body = "Cliffhanger Report: Running the join query succeeded but the result table was empty. \nQuery used: \n" + query;
                } else {
                    $scope.tableResult = response;
                    $scope.progressType = 'success';
                }
            },
            //error
            function (error) {
                $scope.loadingPreview = false;
                $scope.progressType = 'danger';
                $scope.queryRanFine = false;
                $scope.connectionFailed = true;
                $scope.newProblemInput.body = "ERROR : \n" + error.message + "\n\nQUERY: \n" + query;
                $scope.error = error.message;
                $log.error('Failed to connect to server');
            });
    };

    //loads the tags when on page 2
    $scope.$watch('selectedDatasets', function () {
        if ($scope.step == 2) {
            $log.debug("load tags");
            $scope.loadTags();
        }
    }, true);

    //
    $scope.showNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = true;
    };

    //
    $scope.hideNotifyDevsForm = function () {
        $scope.shouldShowNotifyDevsForm = false;
    };

    //creates a discussion thread
    $scope.reportProblem = function () {
        issueService.createIssue($scope.newProblemInput).then(

            function (response) {
                // success
                $scope.alerts.push({
                    msg: "Your problem has been reported to the developers.",
                    type: 'success'
                })
                $scope.contentToShow = 'QUERY_WIZARD_DEFAULT'

            },
            function (data) {
                // fail
                $scope.alerts.push({
                    msg: "There was a problem reporting your problem... sorry.",
                    type: 'danger'
                })
                $scope.contentToShow = 'QUERY_WIZARD_DEFAULT'

            });
    };
});
