angular.module('cliffhanger.datasets', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/datasets', {
            templateUrl: 'views/datasets/datasets.html',
            controller: 'DatasetsCtrl'
        });
}]);

var datasets = angular.module('cliffhanger.datasets');

//main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, datasetService, metaTypeService) {

    $scope.selected = [];
    $scope.showLoadingDatasetsMessage = true;
    $scope.showNoDatasetsMessage = false;
    $scope.showAddingDatasetMessage = false;
    $scope.showFailedAddDatasetMessage = false;
    $scope.showFailedLoadDatasetsMessage = false;

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
    }


    var getMetaTypes = function () {
        metaTypeService.getAllMetaTypes()
            .then(
                function (data) {
                    if (data.status == 'Success') {
                        $scope.metaTypes = eval(data.obj);
                        $log.debug('metatypes', $scope.metaTypes);
                    }

                },
                function (data) {
                    $log.error('Failed to load!');
                });
    };

    getMetaTypes();

    var getDatasets = function () {
        $scope.showFailedLoadDatasetsMessage = false;
        $scope.showLoadingDatasetsMessage = true;
        datasetService.getAllDatasets()
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.showNoDatasetsMessage = false;
                    $scope.showLoadingDatasetsMessage = false;
                    $scope.datasetList = eval(data.obj);
                    $log.debug($scope.datasetList);
                    if ($scope.datasetList.length == 0) {
                        $scope.showNoDatasetsMessage = true;
                    }
                } else {
                    $scope.showLoadingDatasetsMessage = false;
                    $scope.showFailedLoadDatasetsMessage = true;
                }
            }, function (data) {
                $scope.showLoadingDatasetsMessage = false;
                $scope.showFailedLoadDatasetsMessage = true;
            })
    };
    getDatasets();

    var createDataset = function (newDataSet) {
        $scope.showNoDatasetsMessage = false;
        $scope.showFailedAddDatasetMessage = false;
        $scope.showAddingDatasetMessage = true;
        datasetService.addDataset(newDataSet)
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.showAddingDatasetMessage = false;
                    $scope.datasetList.push(newDataSet);
                } else {
                    $scope.showFailedAddDatasetMessage = true;
                }
            }, function (data) {
                $scope.showFailedAddDatasetMessage = true;
            })
    };

    //opens addDatasetModal
    $scope.open = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addDatasetModalContent.html',
            controller: 'AddDatasetModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (newDataSet) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info('Name : ' + newDataSet.name);
            $log.info('Description : ' + newDataSet.desc);
            $log.info(newDataSet);
            //test json builder
            datasetService.addDataset(newDataSet);
            //retrieve all datasets
            //$scope.datasetList = datasetService.getAllDatasets();
        });
    };


    //opens displayInfo modal for dataset d
    $scope.displayInfo = function (d) {
        $log.log(d);
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetInfo.html',
            controller: 'DatasetInfoModalCtrl',
            size: 'lg',
            resolve: {
                dataset: function () {
                    return d;
                }
            }
        });
    };

    //opnes deleteDataset modal for dataset d
    $scope.deleteDataset = function (d) {
        $log.log(d);
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetDelete.html',
            controller: 'DatasetDeleteModalCtrl',
            size: 'md',
            resolve: {
                dataset: function () {
                    return d;
                }
            }
        });

        //on modal completion
        modalInstance.result.then(function (d) {
            $log.warn('Deleted' + d);
            for (i in $scope.data) {
                if (d.name == $scope.data[i].name) {
                    $scope.data.splice(i, 1);
                }
            }
            $log.log($scope.data);
        });
    };

    //watch for check all checkbox
    $scope.$watch('selectAll', function (v) {
        for (i in $scope.selected) {
            $scope.selected[i] = v;
        }
    });

    $scope.deselectAll = function () {
        $scope.selectAll = false;
    };




});


//controller for an instance of AddDatasetModal
datasets.controller('AddDatasetModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
    $scope.step = 1; //what step is the modal on
    $scope.input = { //what is the input from the user
        name: "",
        description: "",
        attributes: []
    };
    $scope.newAttribute = {
        col_name: "",
        description: "",
        data_type: "String",
        meta_type: {
            meta_name: "",
            description: ""
        }
    };

    $scope.tags = [
        {
            meta_name: 'COUNTY',
            description: 'A county of Iowa'
        },
        {
            meta_name: 'ZIP',
            description: 'Zip Code'
        },
        {
            meta_name: 'SSN',
            description: 'Social Security Number'
        }
    ];


    //advance the modal to the next step
    $scope.next = function () {
        $scope.step++;
    };

    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
    };

    //complete the modal
    $scope.submit = function () {
        var temp = {};
        Object.assign(temp, $scope.newAttribute);
        $scope.input.attributes.push(temp);
        $uibModalInstance.close($scope.input);
    };

    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selectType = function (selectedType) {
        $scope.newAttribute.data_type = selectedType;
    };

    $scope.selectTag = function (selectedTag) {
        $scope.newAttribute.meta_type = selectedTag;
    };

    //add an attribute to the input
    $scope.addAttr = function () {
        $log.debug($scope.newAttribute);
        if ($scope.newAttribute.col_name != "" && $scope.newAttribute.data_type != "") {
            var temp = {};
            Object.assign(temp, $scope.newAttribute);
            $scope.input.attributes.push(temp);
            $scope.newAttribute.col_name = "";
            $scope.newAttribute.description = "";
            $scope.newAttribute.meta_type = {
                meta_name: '',
                description: ''
            };
            $scope.newAttribute.data_type = "String";
        }
    };

    //remove attribute from input
    $scope.removeAttr = function (selectedAttr) {
        $log.log(selectedAttr);
        $scope.input.attr.splice(selectedAttr, 1);
    };

});


//controller for instance of DatasetInfoModal
datasets.controller('DatasetInfoModalCtrl', function ($scope, $uibModalInstance, $log, dataset) {
    $scope.dataset = dataset;

    //dismiss modal
    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };
});

//controller for instance of DatasetDeleteModal
datasets.controller('DatasetDeleteModalCtrl', function ($scope, $uibModalInstance, $log, dataset) {

    $scope.dataset = dataset;

    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(dataset);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
