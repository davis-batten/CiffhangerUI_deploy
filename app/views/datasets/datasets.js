angular.module('cliffhanger.datasets', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/developer/datasets', {
            templateUrl: 'views/datasets/datasets.html'
            , controller: 'DatasetsCtrl'
        });
}]);

var datasets = angular.module('cliffhanger.datasets');

//main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, datasetService) {

    $scope.selected = [];
    $scope.showNoDatasetsMessage = false;

    $scope.alerts = []; //list of alerts to show to user

    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
    }



    // getTags();

    var getDatasets = function () {
        $scope.showProgressBar = true;
        datasetService.getAllDatasets()
            .then(function (data) {
                $scope.showProgressBar = false;
                if (data.status == 'Success') {
                    $scope.showNoDatasetsMessage = false;
                    $scope.datasetList = eval(data.data);
                    $log.debug($scope.datasetList);
                    if ($scope.datasetList.length == 0) {
                        $scope.showNoDatasetsMessage = true;
                    }
                } else {
                    $scope.alerts.push({
                        msg: res
                        , type: 'danger'
                    });
                }
            }, function (res) {
                $scope.showProgressBar = false;
                $scope.alerts.push({
                    msg: "Failed to load datasetss"
                    , type: 'danger'
                });
            });
    };
    getDatasets();

    var createDataset = function (newDataSet) {
        $scope.showNoDatasetsMessage = false;
        $scope.showProgressBar = true;
        datasetService.addDataset(newDataSet)
            .then(function (data) {
                $scope.showProgressBar = false;
                if (data.status == 'Success') {
                    $scope.datasetList.push(newDataSet);
                } else {
                    $scope.alerts.push({
                        msg: data
                        , type: 'danger'
                    });
                }
            }, function (data) {
                $scope.showProgressBar = false;
                $scope.alerts.push({
                    msg: 'Failed to create Dataset'
                    , type: 'danger'
                });
            })
    };

    //opens addDatasetModal
    $scope.open = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addDatasetModalContent.html'
            , controller: 'AddDatasetModalInstanceCtrl'
            , size: 'lg'
        });

        modalInstance.result.then(function (newDataSet) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info('Name : ' + newDataSet.name);
            $log.info('Description : ' + newDataSet.desc);
            $log.info(newDataSet);
            createDataset(newDataSet);
        });
    };

    //opens updateDataset modal for dataset d
    $scope.updateDataset = function (d) {
        $log.log(d);
        var nameTemp = d.name;

        var modalInstance = $uibModal.open({
            templateUrl: 'datasetUpdate.html'
            , controller: 'DatasetUpdateModalCtrl'
            , size: 'lg'
            , resolve: {
                dataset: function () {
                    return d;
                }
            }
        });
        //executes changes (or carries unchanged values through)
        modalInstance.result.then(function (d) {
            for (i in $scope.datasetList) {
                if (nameTemp == $scope.datasetList[i].name) {
                    if (d.name == null) {
                        $scope.alerts.push({
                            msg: 'Cannot update name to empty value'
                            , type: 'danger'
                        });
                    }
                    $scope.datasetList[i].name = d.name;
                    $scope.datasetList[i].description = d.description;
                }
            }
        });
    };

    //opens displayInfo modal for dataset d
    $scope.displayInfo = function (d) {
        $log.log(d);
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetInfo.html'
            , controller: 'DatasetInfoModalCtrl'
            , size: 'lg'
            , resolve: {
                dataset: function () {
                    return d;
                }
            }
        });

    };

    //opens deleteDataset modal for dataset d
    $scope.deleteDataset = function (d) {
        $log.log(d);
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetDelete.html'
            , controller: 'DatasetDeleteModalCtrl'
            , size: 'md'
            , resolve: {
                dataset: function () {
                    return d;
                }
            }
        });

        //on modal completion
        modalInstance.result.then(function (d) {
            $log.warn('Deleted', d);
            $scope.showProgressBar = true;
            for (i in $scope.datasetList) {
                if (d.name == $scope.datasetList[i].name) {

                    datasetService.deleteDataset(d)
                        .then(function (res) {
                                $scope.showProgressBar = false;
                                if (res.status == 'Success') {
                                    $scope.datasetList.splice(i, 1);
                                    if ($scope.datasetList.length == 0) $scope.showNoDatasetsMessage = true;
                                } else {
                                    $scope.alerts.push({
                                        msg: res
                                        , type: 'danger'
                                    });
                                }
                            }
                            , function (res) {
                                $scope.showProgressBar = false;
                                $scope.alerts.push({
                                    msg: "Problem communicating with server!"
                                    , type: 'danger'
                                });
                            });
                }
            }
            $log.log($scope.data);
        });
    };



});


//controller for an instance of AddDatasetModal
datasets.controller('AddDatasetModalInstanceCtrl', function ($scope, $uibModalInstance, $log, tagService) {
    $scope.step = 1; //what step is the modal on
    $scope.input = { //what is the input from the user
        name: ""
        , description: ""
        , attributes: []
    };
    $scope.newAttribute = {
        col_name: ""
        , description: ""
        , data_type: "String"
        , tag: {
            name: ""
            , description: ""
        }
    };

    //    $scope.tags = [
    //        {
    //            name: 'COUNTY',
    //            description: 'A county of Iowa'
    //        },
    //        {
    //            name: 'ZIP',
    //            description: 'Zip Code'
    //        },
    //        {
    //            name: 'SSN',
    //            description: 'Social Security Number'
    //        }
    //    ];


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
        if ($scope.input.attributes == null) {
            var temp = {};
            Object.assign(temp, $scope.newAttribute);
            $scope.input.attributes.push(temp);
        }
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
        $log.log('selected', selectedTag);
        $scope.newAttribute.tag = selectedTag;
    };

    //add an attribute to the input
    $scope.addAttr = function () {
        $log.debug('new attr', $scope.newAttribute);
        if ($scope.newAttribute.col_name != "" && $scope.newAttribute.data_type != "") {
            var temp = {};
            Object.assign(temp, $scope.newAttribute);
            $scope.input.attributes.push(temp);
            $scope.newAttribute.col_name = "";
            $scope.newAttribute.description = "";
            $scope.newAttribute.tag = {
                name: ''
                , description: ''
            };
            $scope.newAttribute.data_type = "String";
        }
    };

    //remove attribute from input
    $scope.removeAttr = function (selectedAttr) {
        $log.log(selectedAttr);
        $scope.input.attributes.splice(selectedAttr, 1);

    };

    var getTags = function () {
        tagService.getAllTags()
            .then(
                function (data) {
                    if (data.status == 'Success') {
                        $scope.tags = eval(data.data);
                        $log.debug('tags', $scope.tags);
                    }

                }
                , function (data) {
                    $log.error('Failed to load!');
                });
    };
    getTags();

});

//controller for instance of DatasetUpdateModal
datasets.controller('DatasetUpdateModalCtrl', function ($scope, $uibModalInstance, $log, dataset) {

    $scope.dataset = dataset;

    //gets input from user
    $scope.input = {
        name: dataset.name
        , description: dataset.description
    };

    //complete modal
    $scope.complete = function () {
        $uibModalInstance.close($scope.input);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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