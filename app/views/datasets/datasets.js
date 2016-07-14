angular.module('cliffhanger.datasets', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/developer/datasets', {
        templateUrl: 'views/datasets/datasets.html',
        controller: 'DatasetsCtrl',
        activetab: 'datasets'
    });
}]);
var datasets = angular.module('cliffhanger.datasets');
//main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, datasetService, $rootScope) {

    $log.warn($rootScope);

    $scope.selected = [];
    $scope.showNoDatasetsMessage = false;
    $scope.alerts = []; //list of alerts to show to user
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //set theme color
    $rootScope.theme.color = 'green';
    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
            return a.meta_name.toLowerCase().localeCompare(b.meta_name.toLowerCase());
        }
        // getTags();
    var getDatasets = function () {
        $scope.showProgressBar = true;
        datasetService.getAllDatasets().then(function (data) {
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
                    msg: res,
                    type: 'danger'
                });
            }
        }, function (res) {
            $scope.showProgressBar = false;
            $scope.alerts.push({
                msg: "Failed to load datasetss",
                type: 'danger'
            });
        });
    };
    getDatasets();
    var createDataset = function (newDataSet) {
        $scope.showNoDatasetsMessage = false;
        $scope.showProgressBar = true;
        datasetService.addDataset(newDataSet).then(function (data) {
            $scope.showProgressBar = false;
            if (data.status == 'Success') {
                $scope.datasetList.push(data.data);
            } else {
                $scope.alerts.push({
                    msg: data,
                    type: 'danger'
                });
            }
        }, function (data) {
            $scope.showProgressBar = false;
            $scope.alerts.push({
                msg: 'Failed to create Dataset',
                type: 'danger'
            });
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
            createDataset(newDataSet);
        });
    };
    //opens updateDataset modal for dataset d
    $scope.updateDataset = function (d) {
        $log.log(d);
        var nameTemp = d.name;
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetUpdate.html',
            controller: 'DatasetUpdateModalCtrl',
            size: 'lg',
            resolve: {
                dataset: function () {
                    return d;
                }
            }
        });
        //executes changes (or carries unchanged values through)
        modalInstance.result.then(function (d) {
            if (d.name == "") {
                $scope.alerts.push({
                    msg: 'Cannot update name to empty value',
                    type: 'danger'
                });
            } else {
                datasetService.updateDataset(nameTemp, d).then(
                    //success callback
                    function (resp) {
                        if (resp.status == 'Success') {
                            for (i in $scope.datasetList) {
                                if (nameTemp == $scope.datasetList[i].name) {
                                    $scope.datasetList[i] = resp.data;
                                }
                            }
                        }
                        //problem on backend
                        else {
                            $log.warn("Failed to update");
                            $scope.alerts.push({
                                msg: 'Failed to update dataset on backend',
                                type: 'danger'
                            });
                        }
                    }, //error callback
                    function () {
                        $log.error("Failed to connect");
                        $scope.alerts.push({
                            msg: 'Failed to connect',
                            type: 'danger'
                        });
                    });
            }
        });
    };
    //opens deleteDataset modal for dataset d
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
            $log.warn('Deleted', d);
            $scope.showProgressBar = true;
            for (i in $scope.datasetList) {
                if (d.name == $scope.datasetList[i].name) {
                    datasetService.deleteDataset(d).then(function (res) {
                        $scope.showProgressBar = false;
                        if (res.status == 'Success') {
                            $scope.datasetList.splice(i, 1);
                            if ($scope.datasetList.length == 0) $scope.showNoDatasetsMessage = true;
                        } else {
                            $scope.alerts.push({
                                msg: res,
                                type: 'danger'
                            });
                        }
                    }, function (res) {
                        $scope.showProgressBar = false;
                        $scope.alerts.push({
                            msg: "Problem communicating with server!",
                            type: 'danger'
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
        name: "",
        description: "",
        db_table_name: "",
        attributes: []
    };
    $scope.newAttribute = {
        col_name: "",
        description: "",
        data_type: "String",
        tag: {
            name: "<EMPTY>",
            description: ""
        }
    };
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
                name: '<EMPTY>',
                description: ''
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
        tagService.getAllTags().then(function (data) {
            if (data.status == 'Success') {
                $scope.tags = eval(data.data);
                $log.debug('tags', $scope.tags);
            }
        }, function (data) {
            $log.error('Failed to load!');
        });
    };
    getTags();
});
//controller for instance of DatasetUpdateModal
datasets.controller('DatasetUpdateModalCtrl', function ($scope, $uibModalInstance, $log, dataset, tagService) {
    $scope.dataset = dataset;
    //gets input from user
    $scope.input = {
        name: dataset.name,
        description: dataset.description,
        db_table_name: dataset.db_table_name,
        attributes: dataset.attributes
    };
    //complete modal
    $scope.complete = function () {
        $uibModalInstance.close($scope.input);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.replaceTag = function (attrIndex, selectedTag) {
        $log.log('tag switched', selectedTag);
        $scope.dataset.attributes[attrIndex].tag = selectedTag;
    };
    $scope.removeTag = function (attrIndex) {
        $log.log('tag removed', attrIndex);
        $scope.dataset.attributes[attrIndex].tag = {
            name: '<EMPTY>',
            description: ''
        };
    };
    var getTags = function () {
        tagService.getAllTags().then(function (data) {
            if (data.status == 'Success') {
                $scope.tags = eval(data.data);
                $log.debug('tags', $scope.tags);
            }
        }, function (data) {
            $log.error('Failed to load!');
        });
    };
    getTags();
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
