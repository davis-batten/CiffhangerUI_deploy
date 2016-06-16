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
        $scope.tableDirty = true;
//        $scope.updateTable();
    });
    //        //$scope.selectedTags.sort(ignoreCase);
    //    });
    //
    //    //check if table needs to be changed
    //    $scope.$watch('selectedDatasets', function () {
    //        for (i in $scope.tableDirty) $scope.tableDirty[i][] = true;
    //        //$scope.selectedDatasets.sort(ignoreCase);
    //    });


    $scope.selectAllTags = function () {
        $scope.selectedTags = angular.copy($scope.tags);
        $log.info($scope.tags);
    }

    $scope.selectAllDatasets = function () {
        $scope.selectedDatasets = angular.copy($scope.datasets);
    }

    //format row for display in table
    $scope.buildRow = function (dataset) {
//        $log.log("row[i]", $scope.rows[dataset.name]);
//        if ($scope.rows[dataset.name] == undefined || $scope.tableDirty) {

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
//            $scope.rows[dataset.name] = row;

            return row;
//        }

    }



//    $scope.updateTable = function () {
//        $scope.rows = [];
//        for (i in $scope.selectedDatasets) {
//            var dataset = $scope.selectedDatasets[i];
//            $log.log(dataset);
//            $scope.buildRow(dataset);
//        }
//        $scope.tableDirty = false;
//    }



});
