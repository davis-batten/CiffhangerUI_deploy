'use strict';

angular.module('cliffhanger.compare', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl'
    });
}])

.controller('CompareCtrl', function ($scope, $log, $q, $filter, tagService, datasetService, $uibModal) {

    $scope.rows = []; //scope object for storing the rows of the table
    var dirty = {}; //object for determining if a row is in need of updating
    $scope.allTagsSelected = false; //are all the tags selected?s
    $scope.allDatasetsSelected = false; //are all the datasets selected?

    $scope.selectedTags = [];
    $scope.selectedDatasets = [];


    //alphabetically compare two object name strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }


    //helper method to initialize all the necessary scope variables using asynchrounous calls
    function initalize() {
        datasetService.getAllDatasets()
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.datasets = data.data.sort(ignoreCase);
                } else {
                    $scope.alerts.push({
                        msg: data,
                        type: 'danger'
                    });
                }
            }, function (res) {
                $scope.alerts.push({
                    msg: "Failed to load datasets",
                    type: 'danger'
                });
            });
        tagService.getAllTags()
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.tags = data.data.sort(ignoreCase);
                    $scope.tags.splice(0, 1); //remove empty tag from beginning of tag list
                } else {
                    $scope.alerts.push({
                        msg: data.data,
                        type: 'danger'
                    });
                }
            }, function (res) {
                $scope.alerts.push({
                    msg: "Failed to load datasets",
                    type: 'danger'
                });
            });


    }
    initalize();


    //filter the tags available to the typeahead
    $scope.filterTags = function (query) {
        var deferred = $q.defer();

        var filteredTags = $filter('filter')($scope.tags, {
            name: query
        });

        //update noResults flag
        if (filteredTags.length == 0) $scope.noTagResults = true;
        else $scope.noTagResults = false;

        //return resolved promise
        deferred.resolve(filteredTags);
        return deferred.promise;
    };

    //filter the datasets available to the typeahead
    $scope.filterDatasets = function (query) {
        var deferred = $q.defer();
        var filteredDatasets = $filter('filter')($scope.datasets, {
            name: query
        });

        //update noResults flag
        if (filteredDatasets.length == 0) $scope.noDatasetResults = true;
        else $scope.noDatasetResults = false;

        //return resolved promise
        deferred.resolve(filteredDatasets);
        return deferred.promise;
    };


    //table needs to be changed due to a change in $scope.selectedTags
    $scope.$watch('selectedTags', function () {
        $log.debug('tag watcher', $scope.rows);
        //mark all rows as dirty (in need of update)
        for (var i in dirty) {
            if (dirty.hasOwnProperty(i)) {
                dirty[i] = true;
            }
        }
        $scope.updateTable();
    }, true);

    //table needs to be changed due to a change in $scope.selectedDatasets
    $scope.$watch('selectedDatasets', function () {
        $log.debug('dataset watcher', $scope.rows);
        //mark all rows as dirty (in need of update)
        for (var i in dirty) {
            if (dirty.hasOwnProperty(i)) {
                dirty[i] = true;
            }
        }
        $scope.updateTable();
    }, true);


    //onclick method for select all tags button
    $scope.selectAllTags = function () {
        $scope.selectedTags = angular.copy($scope.tags);
        $scope.allTagsSelected = true;
    }

    //onclick method for select all datasets button
    $scope.selectAllDatasets = function () {
        $scope.selectedDatasets = angular.copy($scope.datasets);
        $scope.allDatasetsSelected = true;
    }

    //onclick method for deselect all tags button
    $scope.deselectAllTags = function () {
        $scope.selectedTags = [];
        $scope.allTagsSelected = false;
    }

    //onclick method for deselect all datasets button
    $scope.deselectAllDatasets = function () {
        $scope.selectedDatasets = [];
        $scope.allDatasetsSelected = false;
    }

    //format row for display in table
    $scope.buildRow = function (dataset) {
        //$log.debug('build row', dataset);

        //if row not created or is dirty
        if ($scope.rows[dataset.name] == undefined || dirty[dataset.name]) {

            //sort attributes by column name
            var attr = dataset.attributes.sort(function (a, b) {
                return (a.col_name).localeCompare(b.col_name);
            });
            var row = [];

            //add cells
            for (var t in $scope.selectedTags) {
                var type = 'danger';
                var cols = "";
                var found = false;
                for (var a in attr) {
                    //if column matches tag add green cell (or add column name to existing cell)
                    if (attr[a].tag.name == $scope.selectedTags[t].name) {
                        if (cols != "") cols += ", ";
                        cols += (attr[a].col_name);
                        type = 'success';
                        found = true;
                    }
                }
                if (cols == []) cols = null; //make it an empty red cell
                row.push({
                    name: cols,
                    type: $scope.selectedTags[t],
                    class: type
                });
            }
            $log.log(row);
            dirty[dataset.name] = false; //row no longer needs updating
            $scope.rows[dataset.name] = row; //add created row to scope bound variable
        }
    }

    //output log data - for testing only
    $scope.log = function () {
        $log.info('rows', $scope.rows);
        $log.info('tags', $scope.selectedTags);
        $log.info('datasets', $scope.selectedDatasets);
    }

    //helper function to update all rows in the table
    $scope.updateTable = function () {
        for (var d in $scope.selectedDatasets) {
            $scope.buildRow($scope.selectedDatasets[d]);
        }
    }
    $scope.updateTable(); //call to initalize the table

    //Add empty tag column to table
    $scope.allowUntagged = function () {
        var empty = {
            name: '<EMPTY>'
        }
        $scope.tags.push(empty);
        $scope.selectedTags.push(empty);
        $scope.untagged = true;
    }

    //remove empty tag column from table
    $scope.removeUntagged = function () {
        $scope.tags.pop();
        $scope.selectedTags.pop();
        $scope.untagged = false;
    }

    $scope.selectRelevantTags = function () {
        $scope.selectedTags = [];
        for (var d = 0; d < $scope.selectedDatasets.length; d++) {
            var dataset = $scope.selectedDatasets[d];
            for (var t = 0; t < dataset.tags.length; t++) {
                var tag = dataset.tags[t];
                if ($scope.selectedTags.map(function (obj) {
                        return obj.name;
                    }).indexOf(tag.name) == -1 && tag.name != '<EMPTY>') {
                    $scope.selectedTags.push(tag);
                }
            }
        }
        $log.debug($scope.selectedTags);
    }

    $scope.selectRelevantDatasets = function () {
        $scope.selectedDatasets = [];
        for (var t = 0; t < $scope.selectedTags.length; t++) {
            var tag = $scope.selectedTags[t];
            for (var d = 0; d < $scope.datasets.length; d++) {
                var dataset = $scope.datasets[d];
                if (dataset.tags.map(function (obj) {
                        return obj.name;
                    }).indexOf(tag.name) != -1 && tag.name != '<EMPTY>') {
                    if ($scope.selectedDatasets.map(function (obj) {
                            return obj.name;
                        }).indexOf(dataset.name) == -1) {
                        $scope.selectedDatasets.push(dataset);
                    }
                }
            }
        }
        $log.debug($scope.selectedTags);
    }

    //opens deleteDataset modal for dataset d
    $scope.openQueryWizard = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/query_wizard/query_wizard.html',
            controller: 'QueryWizardCtrl',
            size: 'lg',
            resolve: {
                datasets: function () {
                    return angular.copy($scope.selectedDatasets);
                }
            }
        });

        //on modal completion
        modalInstance.result.then(function () {
            //TODO
        });
    };

});
