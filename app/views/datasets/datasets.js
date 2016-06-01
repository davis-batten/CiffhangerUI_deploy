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
            desc: 'desc1'
        },
        {
            name: 'DataSet2',
            desc: 'desc2'
        },
        {
            name: 'DataSet3',
            desc: 'desc3'
        },
        {
            name: 'DataSet4',
            desc: 'desc4'
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
