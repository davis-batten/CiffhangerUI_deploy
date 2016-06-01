'use strict';

angular.module('cliffhanger.compare', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/datasets/compare', {
        templateUrl: 'views/compare/compare.html',
        controller: 'CompareCtrl'
    });
}])

.controller('CompareCtrl', function ($scope, $log) {

    $scope.metaTypes = ['ZIP', 'SSN', 'Name', 'Country'].sort();

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

    $scope.buildRow = function (attributes, idx) {
        $log.debug(idx);
        if (rows[idx] == null || rows[idx].dirty) {
            var attr = attributes.sort(function (a, b) {
                return (a.type).localeCompare(b.type);
            });
            var row = [];
            $log.log($scope.metaTypes);
            for (var mt in $scope.metaTypes) {
                var found = false;
                for (var a in attr) {
                    if (attr[a].type == $scope.metaTypes[mt]) {
                        row.push({
                            name: attr[a].name,
                            type: attr[a].type,
                            class: 'success'
                        });
                        found = true;
                    }
                }
                if (!found) {
                    row.push({
                        name: 'null',
                        type: $scope.metaTypes[mt],
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

    $scope.buildRow($scope.data[0].attributes);


});
