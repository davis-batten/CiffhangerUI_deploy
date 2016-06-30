'use strict';

var queries = angular.module('cliffhanger.queries', ['ngRoute', 'ngSanitize', 'ngCsv']);

queries.controller('QueryWizardCtrl', function ($scope, $uibModalInstance, $log, datasets, queryService) {
    $scope.query = {}; //container for query
    $scope.tableResult = {};
    $scope.step = 1; //which step in the modal is on
    $scope.maxSteps = 5; //number of steps in modal
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
        //else if ($scope.step == 5) $scope.runQuery($scope.query);
        else if ($scope.step == 5) {
            $scope.runQuery($scope.query);
        }
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
    $scope.save = function () {
        $scope.newQuery = {
            name: newQuery.name,
            description: newQuery.description,
            query: newQuery.SQLString
        };
        queryService.saveQuery($scope.newQuery)
            .then(function (data) {
                if (data.status == 'Success') {
                    $log.debug(data.data)
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

    //add where and limit clause to SQL query string
    $scope.addToQuery = function () {
        //adding both WHERE and LIMIT statement
        if ($scope.statement.where != "" && $scope.statement.limit != "") {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nWHERE " + $scope.statement.where + "\n" + "LIMIT " + $scope.statement.limit + ";";
        }
        //adding WHERE and not LIMIT
        else if ($scope.statement.where != "" && $scope.statement.limit == "") {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nWHERE " + $scope.statement.where + ";";
        }
        //adding LIMIT and not WHERE
        else if ($scope.statement.where == "" && $scope.statement.limit != "") {
            $scope.query = $scope.query.replace(";", "");
            $scope.statement.text = "\nLIMIT " + $scope.statement.limit + ";";
        }
        //adding Neither
        else if ($scope.statement.where == "" && $scope.statement.limit == "") {
            $scope.statement.text = ";";
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

        queryService.buildQuery(queryInput)
            .then(
                function (response) {
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

                }, //failure to connect
                function (data) {
                    $scope.progressType = 'danger';
                    $scope.buildQueryError = true;
                    $log.error('Failed to connect to server');
                })
    };

    $scope.runQuery = function () {
        var query = $scope.query;

        queryService.runQuery(query)
            .then(
                function (response) { //success callback
                    $scope.tableResult = response;
                    $scope.progressType = 'success';

                }, //failure to connect
                function (data) {
                    $scope.progressType = 'danger';
                    $scope.runQueryError = true;
                    $log.error('Failed to connect to server');
                })
    };

});
