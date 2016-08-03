angular.module('cliffhanger.datasets', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/developer/datasets', {
        templateUrl: 'views/datasets/datasets.html',
        controller: 'DatasetsCtrl',
        activetab: 'datasets'
    });
}]);
var datasets = angular.module('cliffhanger.datasets');
//main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, $location, datasetService, $rootScope) {
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
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;

    //for sort by dropdown
    $scope.propertyName = 'name';
    $scope.toggleSortByDropdown = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.status.sortbyisopen = !$scope.status.sortbyisopen;
    };
    $scope.setSort = function (sort) {
        $scope.propertyName = sort;
        $scope.reverse = false;
        if (sort == 'dateCreatedReverse') {
            $scope.propertyName = 'dateCreated';
            $scope.reverse = true;
        }

    };

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

    $scope.previewDataset = function (d) {
        var modalInstance = $uibModal.open({
            templateUrl: 'datasetPreview.html',
            controller: 'DatasetPreviewModalCtrl',
            size: 'lg',
            resolve: {
                dataset: function () {
                    return d;
                }
            }
        })
    }

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
                    $log.debug('dataset being deleted', $scope.datasetList[i]);
                    $log.debug('i', i);
                    var index = i;
                    datasetService.deleteDataset(d).then(function (res) {
                        $scope.showProgressBar = false;
                        if (res.status == 'Success') {
                            $log.debug('i2', index);
                            $scope.datasetList.splice(index, 1);
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
datasets.controller('AddDatasetModalInstanceCtrl', function ($scope, $uibModalInstance, $log, tagService, datasetService, $rootScope) {
    $scope.importingDataset = false;
    $scope.step = 1; //what step is the modal on
    $scope.input = { //what is the input from the user
        name: "",
        description: "",
        db_table_name: "",
        attributes: [],
        createdBy: $rootScope.user.username
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
    $scope.attributeDataFound = false;
    $scope.noHiveTableSelected = true;
    $scope.hdfsDatabases = [];

    //    advance the modal to the next step
    $scope.next = function () {
        if ($scope.step == 1 && $scope.input.db_table_name.length != 0) {
            $scope.importingDataset = true;

            datasetService.getHiveTableSchema($scope.input.db_table_name).then(function (data) {
                if (data.status == "Error" && data.data == "Table does not exist") {
                    $log.warn("Table " + $scope.input.db_table_name + " does does not exist");
                    $scope.importingDataset = false;
                } else {
                    //                    autofill attribute's col_name and data_type
                    $scope.attributeDataFound = true;
                    $scope.input.attributes = data.data;
                    $scope.importingDataset = false;
                }
            }, function (data) {
                $log.warn("A Database Table Name was listed as " + $scope.input.db_table_name + "but we failed to retrieve that table's schema");
                $scope.importingDataset = false;
            })
        }
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
    $scope.selectTagForNewAttribute = function (selectedTag) {
        $log.log('selected', selectedTag);
        $scope.newAttribute.tag = selectedTag;
    };
    $scope.selectTag = function (selectedTag, attrIndex) {
        $log.log('selected', selectedTag);
        $scope.input.attributes[attrIndex].tag = selectedTag;
    };
    $scope.showTables = function (database) {
        database.expanded = !database.expanded;
    };
    $scope.selectTable = function (databaseIndex, table) {
        if (databaseIndex != null) {
            $scope.noHiveTableSelected = false;
            $scope.input.db_table_name = $scope.hdfsDatabases[databaseIndex].db_name + "." + table;
        } else {
            $scope.input.db_table_name = "";
            $scope.noHiveTableSelected = true;
        }
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
                $log.debug('tagsList', $scope.tags);
            }
        }, function (data) {
            $log.error('Failed to load!');
        });
    };
    getTags();

    //    get a list of all tables in hive
    var getTables = function () {
        datasetService.getAllTables().then(function (data) {
            if (data.status == 'Success') {
                $scope.hdfsDatabases = eval(data.data);
                $log.debug('hiveTables', $scope.hiveTables);
            }
        }, function (data) {
            $log.error('Failed retrieve hive tables!');
        });
    }
    getTables();
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
//controller for instance of DatasetPreviewModal
datasets.controller('DatasetPreviewModalCtrl', function ($scope, $uibModalInstance, $log, dataset, datasetService) {
    $scope.dataset = dataset;
    $scope.tableResult = {};
    $scope.alerts = [];
    $scope.loadingPreview = true;
    $scope.queryRanFine = true;
    $scope.connectionFailed = false;
    $scope.noResults = false;

    datasetService.previewDataset($scope.dataset).then(
        function (response) {
            $scope.tableResult = response;
            $scope.loadingPreview = false;
        },
        function (error) {
            $scope.queryRanFine = false;
            $scope.loadingPreview = false;
        }
    );

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
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
