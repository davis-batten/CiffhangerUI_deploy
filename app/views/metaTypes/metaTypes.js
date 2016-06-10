'use strict';

var module = angular.module('cliffhanger.metaTypes', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/datasets/metaTypes', {
        templateUrl: 'views/metaTypes/metaTypes.html',
        controller: 'MetaTypeCtrl'
    });
}]);

//var metaTypes = angular.module('cliffhanger.metaTypes');

//main controller for /#/datasets/metaTypes
module.controller('MetaTypeCtrl', function ($scope, $uibModal, $log, metaTypeService) {

    $scope.selected = undefined;
    $scope.noResults = false;

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
    }

    var getAllMetaTypes = function () {
        metaTypeService.getAllMetaTypes()
            .then(function (data) {
                if (data.status == 'Success') {
                    $log.debug(eval(data.obj));
                    $scope.metaTypes = (eval(data.obj)).sort(ignoreCase);
                } else {
                    // show "No Meta Types"
                }
            })
    };
    getAllMetaTypes();

    var createMetaType = function (newMetaType) {
        metaTypeService.addMetaType(newMetaType)
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.metaTypes.push(newMetaType);
                } else {
                    // display failed
                }
            })
    };

    //opens addMetaModal
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addMetaModalContent.html',
            controller: 'AddMetaModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);

            metaTypeService.addMetaType(input.name, input.desc)
                .then(function (response) {
                        getAllMetaTypes();
                    },
                    function (response) {
                        $log.error('Failure!');
                    });
            $scope.metaTypes.sort(ignoreCase);
        });
    };



});

//controller for an instance of addMetaModal
datasets.controller('AddMetaModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {

    $scope.input = {};

    //complete modal
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});
