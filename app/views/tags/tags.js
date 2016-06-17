var module = angular.module('cliffhanger.tags', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/developer/tags', {
        templateUrl: 'views/tags/tags.html',
        controller: 'TagCtrl'
    });
}]);


//main controller for /#/developer/tags
module.controller('TagCtrl', function ($scope, $uibModal, $log, tagService) {

    $scope.selected = undefined;
    $scope.noResults = false;

    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }

    var getAllTags = function () {
        tagService.getAllTags()
            .then(function (data) {
                if (data.status == 'Success') {
                    $log.debug('data obj', eval(data.data));
                    $scope.tags = (eval(data.data)).sort(ignoreCase);
                } else {
                    $scope.tags = [];
                }
            })
    };
    getAllTags();

    var createTag = function (newTag) {
        tagService.addTag(newTag)
            .then(function (data) {
                if (data.status == 'Success') {
                    $scope.tags.push(newTag);
                } else {
                    // display failed
                }
            })
    };

    //opens addTagModal
    $scope.add = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'addTagModalContent.html',
            controller: 'AddTagModalInstanceCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (input) {
            $log.info('Modal dismissed at: ' + new Date());
            $log.info(input);

            tagService.addTag(input.name, input.description)
                .then(function (response) {
                        getAllTags();
                    },
                    function (response) {
                        $log.error('Failure!');
                    });
            $scope.tags.sort(ignoreCase);
        });
    };

    //opnes deleteDataset modal for dataset d
    $scope.delete = function (t) {
        $log.warn('delete', t);
        var modalInstance = $uibModal.open({
            templateUrl: 'tagDelete.html',
            controller: 'TagDeleteModalCtrl',
            size: 'md',
            resolve: {
                tag: function () {
                    return t;
                }
            }
        });

        //on modal completion
        modalInstance.result.then(function (t) {
            $log.warn('Deleted', t);
            for (i in $scope.tags) {
                if (t.name == $scope.tags[i].name) {
                    $scope.tags.splice(i, 1);
                    //TODO delete with service
                }
            }
        });
    };



});

//controller for an instance of addTagModal
datasets.controller('AddTagModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {

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

//controller for instance of DatasetDeleteModal
datasets.controller('TagDeleteModalCtrl', function ($scope, $uibModalInstance, $log, tag) {

    $scope.tag = tag;

    //complete modal
    $scope.delete = function () {
        $uibModalInstance.close(tag);
    };

    //dismiss modal
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
