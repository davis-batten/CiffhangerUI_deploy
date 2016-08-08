angular.module('cliffhanger.datasets', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/developer/datasets', {
        templateUrl: 'views/datasets/datasets.html',
        controller: 'DatasetsCtrl',
        activetab: 'datasets'
    });
}]);
var datasets = angular.module('cliffhanger.datasets');

// Main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, $location, datasetService, $rootScope) {

    // List of selected attribtues
    $scope.selected = [];

    // List of alerts to show to user
    $scope.alerts = [];

    $scope.showNoDatasetsMessage = false;

    // Default dataset property to sort by
    $scope.propertyToSortyBy = 'name';

    $rootScope.theme.color = 'green';

    // Bring user to log in screen if not authenticated
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });

    // On click: item in SORT BY dropdown
    $scope.setPropertyToSortBy = function (newSortProperty) {
        $scope.propertyToSortyBy = newSortProperty;
        $scope.shouldSortInReverse = false;
        if (newSortProperty == 'dateCreatedReverse') {
            $scope.propertyToSortyBy = 'dateCreated';
            $scope.shouldSortInReverse = true;
        }

    };

    // On click: X in <uib-alert> element
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };


    var getDatasets = function () {
        $scope.showProgressBar = true;
        datasetService.getAllDatasets().then(
            //success
            function (response) {
                $scope.showProgressBar = false;
                $scope.datasetList = eval(response);
                $log.debug($scope.datasetList);
                if ($scope.datasetList.length == 0) {
                    $scope.showNoDatasetsMessage = true;
                } else $scope.showNoDatasetsMessage = false;

            },
            //error
            function (error) {
                $scope.showProgressBar = false;
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            });
    };
    getDatasets();

    var createDataset = function (newDataSet) {
        $scope.showProgressBar = true;
        datasetService.addDataset(newDataSet).then(
            //success
            function (response) {
                $scope.showProgressBar = false;
                $scope.datasetList.push(response);
            },
            //error
            function (error) {
                $scope.showProgressBar = false;
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            });
    };

    // On click: ADD DATASET
    $scope.openAddDatasetModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/datasets/modals/datasetAdd.html',
            controller: 'AddDatasetModalInstanceCtrl',
            size: 'lg'
        });
        // save dataset when modal is closed
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
            templateUrl: 'views/datasets/modals/datasetPreview.html',
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
            templateUrl: 'views/datasets/modals/datasetUpdate.html',
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
                    function (response) {
                        for (i in $scope.datasetList) {
                            if (nameTemp == $scope.datasetList[i].name) {
                                $scope.datasetList[i] = response;
                            }
                        }
                    },
                    //error callback
                    function (error) {
                        $scope.alerts.push({
                            msg: error.message,
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
            templateUrl: 'views/datasets/modals/datasetDelete.html',
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
                    datasetService.deleteDataset(d).then(
                        //success
                        function (response) {
                            $scope.showProgressBar = false;
                            $log.debug('i2', index);
                            $scope.datasetList.splice(index, 1);
                            if ($scope.datasetList.length == 0) $scope.showNoDatasetsMessage = true;
                        },
                        //error
                        function (error) {
                            $scope.showProgressBar = false;
                            $scope.alerts.push({
                                msg: error.message,
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
    $scope.loadingHiveTables = false;
    $scope.hdfsDatabases = [];
    var tableSwitched = false;


    //    advance the modal to the next step
    $scope.next = function () {
        if ($scope.step == 1 && $scope.input.db_table_name.length != 0) {
            if (tableSwitched == true) {
                $scope.importingDataset = true;
                $scope.attributeDataFound = false;

                datasetService.getHiveTableSchema($scope.input.db_table_name).then(
                    //success
                    function (response) {
                        //autofill attribute's col_name and data_type
                        $scope.attributeDataFound = true;
                        $scope.input.attributes = response;
                        $scope.importingDataset = false;
                        tableSwitched = false;
                    },
                    function (error) {
                        $log.warn("failed to import table schema");
                        $scope.importingDataset = false;
                        tableSwitched = false;
                    })
            }

        } else if ($scope.input.db_table_name.length == 0) {
            $scope.attributeDataFound = false;
            if (tableSwitched == true) $scope.input.attributes.splice(0, $scope.input.attributes.length);
            tableSwitched = false;
        }
        $scope.step++;
    };

    //go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
    };

    //complete the modal
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };
    //dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.selectType = function (attrIndex, selectedType) {
        $scope.input.attributes[attrIndex].data_type = selectedType;
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
        $scope.input.db_table_name = $scope.hdfsDatabases[databaseIndex].db_name + "." + table;
        tableSwitched = true;
    };
    $scope.deselectTable = function (database) {
        $scope.input.db_table_name = "";
        tableSwitched = true;
    };
    $scope.addEmptyAttribute = function () {
            var emptyAttribute = {
                col_name: '',
                description: '',
                data_type: 'string',
                tag: {
                    name: '<EMPTY>',
                    description: ''
                }
            }
            $scope.input.attributes.push(emptyAttribute)
        }
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
    $scope.removeAttr = function (attrIndex) {
        $log.log(attrIndex);
        $scope.input.attributes.splice(attrIndex, 1);
    };
    var getTags = function () {
        tagService.getAllTags().then(
            //success
            function (response) {
                $scope.tags = eval(response);
                $log.debug('tagsList', $scope.tags);

            },
            //error
            function (data) {
                $log.error('Failed to load!');
            });
    };
    getTags();

    //    get a list of all tables in hive
    var getTables = function () {
        $scope.loadingHiveTables = true;
        datasetService.getAllTables().then(
            //success
            function (response) {
                $scope.loadingHiveTables = false;
                $scope.hdfsDatabases = eval(response);
                $log.debug('hiveTables', $scope.hiveTables);

            },
            //error
            function (data) {
                $scope.loadingHiveTables = false;
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
        tagService.getAllTags().then(
            //success
            function (response) {
                $scope.tags = eval(response);
                $log.debug('tags', $scope.tags);

            },
            //error
            function (error) {
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
