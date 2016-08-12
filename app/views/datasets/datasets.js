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

    $rootScope.theme.color = 'green';

    // List of selected attribtues
    $scope.selected = [];

    // List of alerts to show to user
    $scope.alerts = [];

    // Default dataset property to sort by
    $scope.propertyToSortyBy = 'name';

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

    // On click: + ADD DATASET
    $scope.openAddDatasetModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/datasets/modals/datasetAdd.html',
            controller: 'AddDatasetModalCtrl',
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

    // On click: PREVIEW on dataset list item
    $scope.openPreviewDatasetModal = function (dset) {
        event.stopPropagation();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/datasets/modals/datasetPreview.html',
            controller: 'DatasetPreviewModalCtrl',
            size: 'lg',
            resolve: {
                datasetToPreview: function () {
                    return dset;
                }
            }
        })
    }

    // On click: UPDATE on dataset list item
    $scope.openUpdateDatasetModal = function (dset) {
        event.stopPropagation();
        $log.log("Opening update modal on " + dset.name);
        // save the dataset's name before it is updated
        var dsetNameBeforeUpdate = dset.name;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/datasets/modals/datasetUpdate.html',
            controller: 'DatasetUpdateModalCtrl',
            size: 'lg',
            // routes datasetToUpdate to modal's controller 
            resolve: {
                datasetToUpdate: function () {
                    return dset;
                }
            }
        });
        // update dataset after modal is closed
        modalInstance.result.then(function (updatedDataset) {

            datasetService.updateDataset(dsetNameBeforeUpdate, updatedDataset).then(
                // success callback
                function (response) {
                    // replace the old dataset with the new one
                    for (i in $scope.datasetList) {
                        if (dsetNameBeforeUpdate == $scope.datasetList[i].name) {
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

        });
    };

    // On click: DELETE on dataset list item
    $scope.openDeleteDatasetModal = function (dset, dsetIndex) {
        event.stopPropagation();
        $log.log(dset);
        var modalInstance = $uibModal.open({
            templateUrl: 'views/datasets/modals/datasetDelete.html',
            controller: 'DatasetDeleteModalCtrl',
            size: 'md',
            resolve: {
                datasetToDelete: function () {
                    return dset;
                }
            }
        });
        //on modal completion
        modalInstance.result.then(function (datasetToDelete) {
            $log.debug('Deleting dataset: ', datasetToDelete);
            $scope.showProgressBar = true;
            datasetService.deleteDataset(datasetToDelete).then(
                //success
                function (response) {
                    $scope.showProgressBar = false;
                    $scope.datasetList.splice(dsetIndex, 1);;
                },
                //error
                function (error) {
                    $scope.showProgressBar = false;
                    $scope.alerts.push({
                        msg: error.message,
                        type: 'danger'
                    });
                });
        });
    };

    var getDatasets = function () {
        $scope.showProgressBar = true;
        datasetService.getAllDatasets().then(
            //success
            function (response) {
                $scope.showProgressBar = false;
                $scope.datasetList = eval(response);
                $log.debug($scope.datasetList);

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

});

datasets.controller('AddDatasetModalCtrl', function ($scope, $uibModalInstance, $log, tagService, datasetService, $rootScope) {

    // Flag to denote if the program is currently retrieving column data from a hdfs table
    $scope.importingDataset = false;

    // Flag to denote if column data was successfully imported from a table in hdfs
    $scope.attributeDataImported = false;

    // Keeps tracks of what step is the modal on
    $scope.step = 1;

    // Object to hold the input data for a new dataset
    $scope.input = {
        name: "",
        description: "",
        db_table_name: "",
        attributes: [],
        createdBy: $rootScope.user.username
    };

    // Flag to denote if a list of tables and databases in hdfs is currently being retieved 
    $scope.loadingHdfsTables = false;

    // List of databases in hdfs
    // each database in the the list has the following properties:
    // db_name: name of the database (string)
    // tables: a list of the names of tables in the database (string [])
    $scope.hdfsDatabases = [];

    // Flag to denote if the user has gone back and changed or removed the selected DB/Table name after step 1 of the modal
    var tableSwitched = false;

    // On click: NEXT
    // Advance the modal to the next step
    $scope.next = function () {
        // if the user specified an hdfs table to import column data from, import the column data before going on to step 2 of the modal
        if ($scope.input.db_table_name.length != 0) {
            if (tableSwitched == true) {
                $scope.importingDataset = true;
                $scope.attributeDataImported = false;

                datasetService.getHiveTableSchema($scope.input.db_table_name).then(
                    // success callback
                    function (response) {
                        // add attribute's read from hdfs table schema
                        $scope.input.attributes = response;
                        $scope.attributeDataImported = true;
                        $scope.importingDataset = false;
                        tableSwitched = false;
                    },
                    // error callback
                    function (error) {
                        $log.warn("failed to import table schema");
                        $scope.importingDataset = false;
                        tableSwitched = false;
                    })
            }

        } else {
            $scope.attributeDataImported = false;
            if (tableSwitched == true) $scope.input.attributes.splice(0, $scope.input.attributes.length);
            tableSwitched = false;
        }
        $scope.step++;
    };

    // On click: BACK
    // go back a step in the modal
    $scope.previous = function () {
        $scope.step--;
    };

    // On click: SAVE DATASET
    // complete the modal
    $scope.submit = function () {
        $uibModalInstance.close($scope.input);
    };

    // On click: X 
    // dismiss the modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // On click: item in an attribute's DATA TYPE dropdown 
    $scope.selectDataType = function (attrIndex, selectedType) {
        $scope.input.attributes[attrIndex].data_type = selectedType;
    };

    // On click: item in an attribute's HOOK dropdown
    $scope.selectTag = function (selectedTag, attrIndex) {
        $log.log('selected', selectedTag);
        $scope.input.attributes[attrIndex].tag = selectedTag;
    };

    // On click: database name in table-selector
    $scope.showTables = function (database) {
        database.expanded = !database.expanded;
    };

    // On click: table name in table-selector
    // highlight the table name and set <DatabaseName>.<TableName> as the dataset's db_table_name
    $scope.selectTable = function (databaseIndex, table) {
        $scope.input.db_table_name = $scope.hdfsDatabases[databaseIndex].db_name + "." + table;
        tableSwitched = true;
    };

    // On click: TRASH ICON next to the HDFS table
    // reset the dataset's db_table_name so it no longer points to a table in hdfs
    $scope.deselectTable = function (database) {
        $scope.input.db_table_name = "";
        tableSwitched = true;
    };

    // On click: ADD ATTRIBUTE 
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

    // On click: TRASH ICON next to an attribute
    $scope.removeAttr = function (attrIndex) {
        $log.log(attrIndex);
        $scope.input.attributes.splice(attrIndex, 1);
    };

    var getTags = function () {
        tagService.getAllTags().then(
            // success callback
            function (response) {
                $scope.tags = eval(response);
                $log.debug('tagsList', $scope.tags);

            },
            // error callback
            function (data) {
                $log.error('Failed to load!');
            });
    };
    getTags();

    var getTables = function () {
        $scope.loadingHdfsTables = true;
        datasetService.getAllTables().then(
            // success callback
            function (response) {
                $scope.loadingHdfsTables = false;
                $scope.hdfsDatabases = eval(response);
                $log.debug('hiveTables', $scope.hiveTables);
            },
            // error callback
            function (data) {
                $scope.loadingHdfsTables = false;
                $log.error('Failed retrieve hive tables!');
            });
    }
    getTables();
});

datasets.controller('DatasetUpdateModalCtrl', function ($scope, $uibModalInstance, $log, datasetToUpdate, tagService) {

    $scope.input = angular.copy(datasetToUpdate)

    // On click: SAVE CHANGES
    $scope.completeModal = function () {
        $uibModalInstance.close($scope.input);
    };

    // On click: X
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    // On click: item from + dropdown in hook column
    $scope.replaceTag = function (attrIndex, selectedTag) {
        $log.log('tag switched', selectedTag);
        $scope.input.attributes[attrIndex].tag = selectedTag;
    };

    // On click: trash can button in hook column
    $scope.removeTag = function (attrIndex) {
        $log.log('tag removed', attrIndex);
        $scope.input.attributes[attrIndex].tag = {
            name: '<EMPTY>',
            description: ''
        };
    };

    var getTags = function () {
        tagService.getAllTags().then(
            // success callback
            function (response) {
                $scope.tags = eval(response);
                $log.debug('tags', $scope.tags);

            },
            // error callback
            function (error) {
                $log.error('Failed to load!');
            });
    };
    getTags();
});

datasets.controller('DatasetPreviewModalCtrl', function ($scope, $uibModalInstance, $log, datasetToPreview, datasetService) {
    $scope.dataset = datasetToPreview;
    $scope.tableResult = {};
    $scope.alerts = [];
    $scope.loadingPreview = true;

    datasetService.previewDataset($scope.dataset).then(
        function (response) {
            $scope.tableResult = response;
            $scope.loadingPreview = false;
        },
        function (error) {
            $log.debug(error);
            $scope.loadingPreview = false;
            $scope.alerts.push({
                msg: error.message,
                type: 'danger'
            });
        }
    );

    // On click: X in <uib-alert> element
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

datasets.controller('DatasetDeleteModalCtrl', function ($scope, $uibModalInstance, $log, datasetToDelete) {
    $scope.dataset = datasetToDelete;
    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(datasetToDelete);
    };
    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
