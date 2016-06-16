'use strict';

angular.module('cliffhanger.compare', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/analyst/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl'
    });
}])

.controller('CompareCtrl', function ($scope, $log) {
    //test tag
    $scope.tags = ['ZIP', 'SSN', 'Name', 'Country'].sort();
    //test data
    $scope.data = [
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

    //format row for display in table
    $scope.buildRow = function (attributes, idx) {
        //if row not built or changed
        if (rows[idx] == null || rows[idx].dirty) {
            var attr = attributes.sort(function (a, b) {
                return (a.type).localeCompare(b.type);
            });
            var row = [];

            //add cells
            for (var t in $scope.tags) {
                var found = false;
                for (var a in attr) {
                    //if column matches type
                    if (attr[a].type == $scope.tags[t]) {
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
                        type: $scope.tags[t],
                        class: 'danger'
                    });
                }

            }
            $log.log(row);
            rows[idx] = row;
            rows[idx].dirty = false;
        }
        return rows[idx];

    };

    var rows = [];


});
