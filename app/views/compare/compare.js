'use strict';

angular.module('cliffhanger.compare', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl'
    });
}])

.controller('CompareCtrl', function ($scope, $log, $q, $filter) {

    $scope.rows = [];
    var dirty = {};
    $scope.allTagsSelected = false;
    $scope.allDatasetsSelected = false;


    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }

    //test tag
    $scope.tags = [
        {
            name: "SSN",
            description: "social security",
        },
        {
            name: "ZIP",
            description: "zip code"
        },
        {
            name: "address1",
            description: "first line of addresss"
        }
    ].sort(ignoreCase);

    //test data
    $scope.datasets = [
        {
            name: 'DataSet1',
            desc: 'desc1',
            attributes: [
                {
                    name: 'zippy',
                    type: 'ZIP'
                },
                {
                    name: 'id',
                    type: 'SSN'
                },
                {
                    name: 'legal_name',
                    type: 'Name'
                }
            ]
        },
        {
            name: 'DataSet2',
            desc: 'desc2',
            attributes: [
                {
                    name: 'ssn',
                    type: 'SSN'
                },
                {
                    name: 'zip_code',
                    type: 'ZIP'
                }
            ]
        },
        {
            name: 'DataSet3',
            desc: 'desc3',
            attributes: [
                {
                    name: 'id',
                    type: 'SSN'
                },
                {
                    name: 'name',
                    type: 'Name'
                }
            ]
        }
    ];


    $scope.filterTags = function (query) {
        var deferred = $q.defer();
        var filteredTags = $filter('filter')($scope.tags, {
            name: query
        });

        if (filteredTags.length == 0) $scope.noTagResults = true;
        else $scope.noTagResults = false;

        deferred.resolve(filteredTags);
        return deferred.promise;
    };

    $scope.filterDatasets = function (query) {
        var deferred = $q.defer();
        var filteredDatasets = $filter('filter')($scope.datasets, {
            name: query
        });

        if (filteredDatasets.length == 0) $scope.noDatasetResults = true;
        else $scope.noDatasetResults = false;

        deferred.resolve(filteredDatasets);

        return deferred.promise;
    };


    //check if table needs to be changed
    $scope.$watch('selectedTags', function () {
        $log.debug('tag watcher', $scope.rows);
        $log.debug('before', dirty);
        for (var i in dirty) {
            if (dirty.hasOwnProperty(i)) {
                dirty[i] = true;
            }
        }
        updateTable();
    }, true);
    //check if table needs to be changed
    $scope.$watch('selectedDatasets', function () {
        $log.debug('dataset watcher', $scope.rows);
        for (var i in dirty) {
            if (dirty.hasOwnProperty(i)) {
                dirty[i] = true;
            }
        }
        updateTable();
    }, true);


    $scope.selectAllTags = function () {
        $scope.selectedTags = angular.copy($scope.tags);
        $scope.allTagsSelected = true;
    }

    $scope.selectAllDatasets = function () {
        $scope.selectedDatasets = angular.copy($scope.datasets);
        $scope.allDatasetsSelected = true;
    }

    $scope.deselectAllTags = function () {
        $scope.selectedTags = [];
        $scope.allTagsSelected = false;
    }

    $scope.deselectAllDatasets = function () {
        $scope.selectedDatasets = [];
        $scope.allDatasetsSelected = false;
    }

    //format row for display in table
    $scope.buildRow = function (dataset) {
        $log.debug('build row', dataset);

        if ($scope.rows[dataset.name] == undefined || dirty[dataset.name]) {

            var attr = dataset.attributes.sort(function (a, b) {
                return (a.type).localeCompare(b.type);
            });
            var row = [];

            //add cells
            for (var t in $scope.selectedTags) {
                var found = false;
                for (var a in attr) {
                    //if column matches type
                    if (attr[a].type == $scope.selectedTags[t].name) {
                        row.push({
                            name: attr[a].name,
                            type: attr[a].type,
                            class: 'success'
                        });
                        found = true;
                    }
                }
                // no column of this type
                if (!found) {
                    row.push({
                        name: null,
                        type: $scope.selectedTags[t],
                        class: 'danger'
                    });
                }

            }
            $log.log(row);
            dirty[dataset.name] = false;
            $scope.rows[dataset.name] = row;
        }
    }

    var updateTable = function () {
        for (var d in $scope.selectedDatasets) {
            $scope.buildRow($scope.selectedDatasets[d]);
        }
    }

    updateTable();


    $scope.log = function () {
        $log.info('tags', $scope.selectedTags);
        $log.info('datasets', $scope.selectedDatasets);
    }


});
