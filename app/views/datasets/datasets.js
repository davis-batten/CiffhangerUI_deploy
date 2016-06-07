angular.module('cliffhanger.datasets', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/datasets', {
            templateUrl: 'views/datasets/datasets.html',
            controller: 'DatasetsCtrl'
        });
}]);

var datasets = angular.module('cliffhanger.datasets');

//main controller for dataset page
datasets.controller('DatasetsCtrl', function ($scope, $uibModal, $log, datasetService) {

    $scope.selected = [];
    

    //test data
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
            //update local data
            $scope.data.push(newDataSet);

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
    }

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
    }

    //watch for check all checkbox
    $scope.$watch('selectAll', function (v) {
        for (i in $scope.selected) {
            $scope.selected[i] = v;
        }
    });

    $scope.deselectAll = function () {
        $scope.selectAll = false;
    }




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
                metatype_name: "",
                metatype_description: ""
            }
    };
    
     $scope.tags = [
        {
            metatype_name: 'IA County',
            metatype_description: 'An county of Iowa'
        },
        {
            metatype_name: 'Zip Code',
            metatype_description: ''
        },
         {
            metatype_name: '',
            metatype_description: ''
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
        $scope.newAttribute.data_type = newSelectedType;
    }
    
    $scope.selectTag = function (selectedTag) {
        $scope.newAttribute.meta_type = selectedTag;
    }

    //add an attribute to the input
    $scope.addAttr = function () {
        if ($scope.newAttribute.col_name != "" && $scope.newAttribute.data_type != "" ) {
            var temp = {};
            Object.assign(temp, $scope.newAttribute);
            $scope.input.attributes.push(temp);
            $scope.newAttribute.col_name = "";
            $scope.newAttribute.description = "";
            $scope.newAttribute.meta_type = "";
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
    }
})

//controller for instance of DatasetDeleteModal
datasets.controller('DatasetDeleteModalCtrl', function ($scope, $uibModalInstance, $log, dataset) {

    $scope.dataset = dataset;

    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(dataset);
    }

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }
})
