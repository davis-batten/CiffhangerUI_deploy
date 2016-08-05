angular.module('cliffhanger.compare', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl',
        activetab: 'compare'
    });
}]).controller('CompareCtrl', function ($scope, $log, $q, $filter, $location, tagService, datasetService, $uibModal, $rootScope) {

    // Data in these arrays are bound to the <tags-input> elements
    $scope.selectedTags = [];
    $scope.selectedDatasets = [];

    // Flag to denote if all the tags should be selected
    $scope.allDatasetsSelected = false;

    // Flag to denote if all the tags should be selected
    $scope.allTagsSelected = false;

    // Flag to denote if <EMPTY> tagged attributes should be shown on the <ui-grid> compare martix
    $scope.showUntaggedAttributes = false;

    // Object to define the <ui-grid> element
    $scope.matrix = {
        // List of columns in the matrix 
        columnDefs: [
            // The first column is always a label for each object in the data array containing the name of the dataset, columns
            {
                name: 'datasetName',
                displayName: 'Dataset', // Defines the label for the column in the header
                field: 'datasetName', // The property to display in the cell for this column of each object in data
                enablePinning: true,
                pinnedLeft: true, // Pins this column to the left so dataset names are still displayed if you scroll horizontally
                width: 200,
                enableColumnMenu: false, // Disables dropdown menu holding sort options

                headerCellClass: 'matrix-header',
                cellClass: 'matrix-row-header'
            }
        ],
        // List of objects that define rows in the matrix, correlates to the selected datasets
        data: [],
        // Defines height for the scrollable view area of the matrix
        minRowsToShow: 10
    };


    // Makes sure the user is logged in, if not they are brought to the login screen
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    $rootScope.theme.color = 'blue';

    var emptyTag = {
        name: '<EMPTY>',
        description: ''
    };



    // On click: Datasets -> SELECT ALL button
    $scope.selectAllDatasets = function () {
        $scope.selectedDatasets = angular.copy($scope.datasets);
        // remove all rows from the <ui-grid> compare matrix
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        // add all datasets as new rows to the <ui-grid> compare matrix
        for (var i in $scope.selectedDatasets) {
            $scope.selectDataset($scope.selectedDatasets[i]);
        }
        $scope.allDatasetsSelected = true;
    }

    // On click: Datasets -> DESELECT ALL button
    $scope.deselectAllDatasets = function () {
        // Remove all datasets from <tags-input> element
        $scope.selectedDatasets = [];
        // Remove all rows in the <ui-grid> compare matric
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        $scope.allDatasetsSelected = false;
    }

    // On click: Datasets -> SELECT RELEVANT button
    //    selects all datasets which have attributes with the shown tags
    $scope.selectRelevantDatasets = function () {
        // clear selected datasets
        $scope.selectedDatasets = [];
        $scope.matrix.data.splice(0, $scope.matrix.data.length);
        // for all the tags being shown, look through all datasets and check if they have data for that tag
        for (var t = 0; t < $scope.selectedTags.length; t++) {
            var tag = $scope.selectedTags[t];
            for (var d = 0; d < $scope.datasets.length; d++) {
                var dataset = $scope.datasets[d];
                // add the dataset to selectedDatasets if it contains the tag, the tag is not <EMPTY>, and the dataset is not already added
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
        // show all datasets just selected
        for (var i in $scope.selectedDatasets) {
            $scope.selectDataset($scope.selectedDatasets[i]);
        }
        $log.debug($scope.selectedTags);
    }

    // On input: Datasets -> typing in <tags-input> field
    //    filter datasets based on dataset name using input in the <auto-complete> element
    $scope.filterDatasets = function (query) {
        var deferred = $q.defer();
        var filteredDatasets = $filter('filter')($scope.datasets, {
            name: query
        });
        // update noDatasetsMatchFilterInput flag
        if (filteredDatasets.length == 0) $scope.noDatasetsMatchFilterInput = true;
        else $scope.noDatasetsMatchFilterInput = false;
        // return resolved promise
        deferred.resolve(filteredDatasets);
        return deferred.promise;
    };

    // On click: Datasets -> a dataset name in <tags-input> dropdown
    //   creates a new row in the <ui-grid> compare matrix for the selected dataset
    $scope.selectDataset = function (dataset) {
        $log.info("dataset selected: " + dataset.name);
        var newMatrixDataEntry = {
            datasetName: dataset.name,
            datasetObj: dataset
        };
        for (var i in $scope.selectedTags) {
            // generate content to go in the cell for each tag being shown's column on the compare matrix (a string of col_names of attributes with that tage)
            var cellContent = getCellContent(dataset, $scope.selectedTags[i]);
            // add a property to the matrix data object which looks like '<the tag's name>': "<the cell content>"
            newMatrixDataEntry[$scope.selectedTags[i].name] = cellContent;
        }
        $scope.matrix.data.push(newMatrixDataEntry);
        $log.debug($scope.matrix);
    }

    // On click: Datasets -> x on a dataset name in <tags-input> field
    $scope.deselectDataset = function (dataset) {
        // 
        for (var i in $scope.matrix.data) {
            if ($scope.matrix.data[i].datasetObj.name == dataset.name) {
                $scope.matrix.data.splice(i, 1);
                break;
            }
        }
    }


    // On click: Hooks -> SELECT ALL
    $scope.selectAllTags = function () {
        $scope.selectedTags = angular.copy($scope.tags);
        // remove all columns from <ui-grid> compare matrix besides the first one (for the dataset names)
        $scope.matrix.columnDefs.splice(1, $scope.matrix.data.length - 1);
        // add all tags as columns to the <ui-grid> compare matrix
        for (var i in $scope.selectedTags) {
            $scope.showTag($scope.selectedTags[i]);
        }
        $scope.allTagsSelected = true;
    }

    // On click: Hooks -> DESELECT ALL
    $scope.deselectAllTags = function () {
        // Remove all tags from the <tags-input> element
        $scope.selectedTags.splice(0, $scope.selectedTags.length)
            // Remove all columns after the first column (for dataset names) from the <ui-grid> compare matrix
        $scope.matrix.columnDefs.splice(1, $scope.matrix.columnDefs.length - 1)
        $scope.allTagsSelected = false;
    }

    // On click: Hooks -> SHOW/HIDE UNHOOKED ATTRIBUTES 
    //   switches bewteen showing and hiding column for dataset attributes with '<EMPTY>' tag
    $scope.toggleUntaggedAttributesColumn = function () {
        if ($scope.showUntaggedAttributes == false) $scope.showTag(emptyTag);
        else $scope.hideTag(emptyTag);
        $scope.showUntaggedAttributes = !$scope.showUntaggedAttributes;
    }

    // On click: Hooks -> SELECT RELEVANT
    //   shows only tags which are used in the selected datasets
    $scope.selectRelevantTags = function () {
        // clear tags being shown
        $scope.selectedTags = [];
        $scope.matrix.columnDefs.splice(1, $scope.matrix.columnDefs.length - 1);
        // look through each selected dataset's list of tags it contains
        for (var d = 0; d < $scope.selectedDatasets.length; d++) {
            var dataset = $scope.selectedDatasets[d];
            for (var t = 0; t < dataset.tags.length; t++) {
                var tag = dataset.tags[t];
                // add the tag to selected tags if its not already added
                if ($scope.selectedTags.map(function (obj) {
                        return obj.name;
                    }).indexOf(tag.name) == -1 && tag.name != '<EMPTY>') {
                    $scope.selectedTags.push(tag);
                }
            }
        }
        // show all tags just selected
        for (var i in $scope.selectedTags) {
            $scope.showTag($scope.selectedTags[i]);
        }
        $log.debug($scope.selectedTags);
    }

    // On input: Hooks -> typing in <tags-input> field
    //   filter tags based on tag name using input in the <auto-complete> element
    $scope.filterTags = function (query) {
        var deferred = $q.defer();
        var filteredTags = $filter('filter')($scope.tags, {
            name: query
        });
        // update noTagMatchFilterInput flag
        if (filteredTags.length == 0) $scope.noTagsMatchFilterInput = true;
        else $scope.noTagsMatchFilterInput = false;
        // return resolved promise
        deferred.resolve(filteredTags);
        return deferred.promise;
    };

    // On click: Hooks -> a tag name in <tags-input> dropdown
    //   Adds a tag as a column to the <ui-grid> compare matrix
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

    // On click: Hooks -> x on a tag's name in <tags-input> field
    // Removes tag's column from the <ui-grid> compare matrix
    $scope.hideTag = function (tag) {
        for (var i in $scope.matrix.columnDefs) {
            if ($scope.matrix.columnDefs[i].field == tag.name) {
                $scope.matrix.columnDefs.splice(i, 1);
                break;
            }
        }
    }


    // On click: BUILD CUSTOM TABLE
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
    };



    // Asynchrounously retrieve the datasets and tags, to be used on page load
    var initialize = function () {
        datasetService.getAllDatasets().then(function (data) {
            if (data.status == 'Success') {
                // sort the retireved datasets alphabetically by name and save them
                $scope.datasets = data.data.sort(compareAplphaIgnoreCase);
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
                // sort the retireved tags alphabetically by name and save them
                $scope.tags = data.data.sort(compareAplphaIgnoreCase);
                // remove empty tag from beginning of tag list
                $scope.tags.splice(0, 1);
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
    };
    initialize();

    // Alphabetically compare two strings: a and b, ignoring case
    var compareAplphaIgnoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    };

    // Generate the content to display in a cell of the <ui-grid> compare matrix
    // params: dataset, tag 
    // returns: string of comma seperated col_names for the dataset's attributes that have the tag
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
});
