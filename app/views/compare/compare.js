angular.module('cliffhanger.compare', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl'
    });

}]).controller('CompareCtrl', function ($scope, $log, $q, $filter, tagService, datasetService, $uibModal, $rootScope) {

    $scope.allTagsSelected = false; //are all the tags selected?s
    $scope.allDatasetsSelected = false; //are all the datasets selected?
    $scope.selectedTags = [];
    $scope.selectedDatasets = [];

    //set theme color
    $rootScope.theme.color = 'blue';

    $scope.matrix = {
        columnDefs: [
            {
                name: 'datasetName',
                displayName: 'Dataset',
                field: 'datasetName',
                eneablePinning: true,
                pinnedLeft: true,
                width: 200,
                enableColumnMenu: false,
                headerCellClass: 'matrix-header',
                cellClass: 'matrix-row-header'
            }
        ],
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        },
        minRowsToShow: 10
    };

    var emptyTag = {
        name: '<EMPTY>',
        description: ''
    };

    //alphabetically compare two object name strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    };
    //helper method to initialize all the necessary scope variables using asynchrounous calls

    function initalize() {
        datasetService.getAllDatasets().then(function (data) {
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
        tagService.getAllTags().then(function (data) {
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
    //onclick method for select all tags button
    $scope.selectAllTags = function () {
        $scope.selectedTags = angular.copy($scope.tags);
        $scope.matrix.columnDefs = [
            {
                name: 'datasetName',
                displayName: 'Dataset',
                field: 'datasetName',
                eneablePinning: true,
                pinnedLeft: true,
                width: 200,
                enableColumnMenu: false,
                headerCellClass: 'matrix-header',
                cellClass: 'matrix-row-header'
                }
        ];
        for (var i in $scope.selectedTags) {
            $scope.showTag($scope.selectedTags[i]);
        }
        $scope.allowUntagged();
        $scope.allTagsSelected = true;
    }

    //onclick method for select all datasets button
    $scope.selectAllDatasets = function () {
        $scope.selectedDatasets = angular.copy($scope.datasets);
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        for (var i in $scope.selectedDatasets) {
            $scope.selectDataset($scope.selectedDatasets[i]);
        }
        $scope.allDatasetsSelected = true;

    }

    //onclick method for deselect all tags button
    $scope.deselectAllTags = function () {
        $scope.selectedTags.splice(0, $scope.selectedTags.length)
        $scope.matrix.columnDefs.splice(1, $scope.matrix.columnDefs.length - 1)
        $scope.allTagsSelected = false;
    }

    //onclick method for deselect all datasets button
    $scope.deselectAllDatasets = function () {
        $scope.selectedDatasets = [];
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        $scope.allDatasetsSelected = false;
    }

    //output log data - for testing only
    $scope.log = function () {
        $log.info('rows', $scope.rows);
        $log.info('tags', $scope.selectedTags);
        $log.info('datasets', $scope.selectedDatasets);
    }

    //Add empty tag column to table
    $scope.allowUntagged = function () {
        $scope.selectedTags.push(emptyTag);
        $scope.showTag(emptyTag);
        $scope.untagged = true;
    }

    //remove empty tag column from table

    $scope.removeUntagged = function () {
        for (var i in $scope.selectedTags) {
            if ($scope.selectedTags[i].field == emptyTag.name) {
                $scope.selectedTags.splice(i, 1);
                break;
            }
        }
        $scope.hideTag(emptyTag);
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
        $scope.matrix.columnDefs.splice(1, $scope.matrix.columnDefs.length - 1);
        for (var i in $scope.selectedTags) {
            $scope.showTag($scope.selectedTags[i]);
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
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        for (var i in $scope.selectedDatasets) {
            $scope.selectDataset($scope.selectedDatasets[i]);
        }
        $log.debug($scope.selectedTags);
    }

    //opens query wizard modal

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

    $scope.selectDataset = function (dataset) {
        $log.info("dataset selected: " + dataset.name);
        var newMatrixDataEntry = {
            datasetName: dataset.name,
            datasetObj: dataset
        };
        for (var i in $scope.selectedTags) {
            // check if dataset has that tag on one of its columns
            var cellContent = getCellContent(dataset, $scope.selectedTags[i])
            newMatrixDataEntry[$scope.selectedTags[i].name] = cellContent;
        }
        $scope.matrix.data.push(newMatrixDataEntry);
        $log.debug($scope.matrix);
    }

    $scope.deselectDataset = function (dataset) {
        for (var i in $scope.matrix.data) {
            if ($scope.matrix.data[i].datasetObj.name == dataset.name) {
                $scope.matrix.data.splice(i, 1);
                break;
            }
        }
    }

    var getCellContent = function (dataset, tag) {
        var cellContent = "";
        for (var j in dataset.attributes) {
            if (tag.name == dataset.attributes[j].tag.name) {
                if (cellContent != "") cellContent += ", ";
                cellContent += dataset.attributes[j].col_name;
            }
        }
        return cellContent;
    }

    $scope.showTag = function (tag) {
        $log.info("tag selected: " + tag.name);
        // Add a cell to each row
        for (var i in $scope.matrix.data) {
            var cellContent = getCellContent($scope.matrix.data[i].datasetObj, tag);
            $scope.matrix.data[i][tag.name] = cellContent;
        }
        $scope.matrix.columnDefs.push({
            name: tag.name,
            width: 200,
            field: tag.name,
            enableColumnMenu: false,
            headerCellClass: 'matrix-header',
            cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                if (grid.getCellValue(row, col) != "") {
                    return 'matrix-match-cell';
                } else return 'matrix-no-match-cell';
            }
        });


    };

    $scope.hideTag = function (tag) {
        for (var i in $scope.matrix.columnDefs) {
            if ($scope.matrix.columnDefs[i].field == tag.name) {
                $scope.matrix.columnDefs.splice(i, 1);
                break;
            }
        }
    }
});
