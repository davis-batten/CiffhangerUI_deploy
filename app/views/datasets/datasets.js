angular.module('cliffhanger.datasets', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/datasets', {
            templateUrl: 'views/datasets/datasets.html',
            controller: 'DatasetsCtrl'
        });
}]);

var datasets = angular.module('cliffhanger.datasets');

datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, datasetService) {

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


    $scope.open = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addDatasetModalContent.html',
            controller: 'AddDatasetModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info('Name : ' + input.name);
            $log.info('Description : ' + input.desc);
            $log.info(input);
            //test json builder
            datasetService.addDataset(input.name, input.desc, input.metatags);
        });
    };

    $scope.log = function () {
        $log.log($scope.data);
        var selected = [];
        for (i in $scope.data) {
            var d = $scope.data[i];
            if (d.checked == true) selected.push(d.name);
        }
        $log.log(selected);
    }

    $scope.displayInfo = function (d) {
        $log.log(d);
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetInfo.html',
            controller: 'DatasetInfoCtrl',
            size: 'lg',
            resolve: {
                dataset: function () {
                    return d;
                }
            }
        });
    }




});



datasets.controller('AddDatasetModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
    $scope.step = 1;
    $scope.input = {};
    $scope.input.metatags = [];


    $scope.next = function () {
        $scope.step++;
    };

    $scope.previous = function () {
        $scope.step--;
    };

    $scope.submit = function () {

        $uibModalInstance.close($scope.input);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };



    $scope.addAttr = function () {
        if ($scope.input.attribute.name != "" && $scope.input.attribute.type != "") {
            var temp = {};
            Object.assign(temp, $scope.input.attribute);
            $scope.input.metatags.push(temp);
            $scope.input.attribute.name = "";
            $scope.input.attribute.type = "";
        }
    };

    $scope.removeAttr = function (selectedAttr) {
        $log.log(selectedAttr);
        $scope.input.metatags.splice(selectedAttr, 1);
    };

});



datasets.controller('DatasetInfoCtrl', function ($scope, $uibModalInstance, $log, dataset) {
    $scope.dataset = dataset;

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    }
})
