var tags = angular.module('cliffhanger.tags', ['ngRoute']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/developer/tags', {
        templateUrl: 'views/tags/tags.html',
        controller: 'TagCtrl',
        activetab: 'tags'
    });
}]);
//main controller for /#/developer/tags
tags.controller('TagCtrl', function ($scope, $uibModal, $log, $location, tagService, $rootScope) {
    $scope.selected = undefined;
    $scope.noResults = false;
    $scope.alerts = []; //list of alerts to show to user
    //set theme color
    $rootScope.theme.color = 'green';
    $rootScope.$watch('user', function () {
        if ($rootScope.user.username == null) {
            $location.url('/');
        }
    });
    $scope.isCollapsed = true;
    //closes an alert
    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };
    //alphabetically compare two strings, ignoring case
    var ignoreCase = function (a, b) {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    }
    $scope.getAllTags = function () {
        tagService.getAllTags().then(
            //success
            function (response) {
                $scope.tags = response.sort(ignoreCase);
            },
            //error
            function (error) {
                $scope.tags = [];
                $scope.alerts.push({
                    msg: error.message,
                    type: 'danger'
                });
            });
    }
    $scope.getAllTags();

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
            tagService.addTag(input.name, input.description).then(
                //success
                function (response) {
                    //                    $scope.getAllTags();
                    $scope.tags.push(response);
                },
                //error
                function (error) {
                    $log.error('Failure!');
                    $scope.alerts.push({
                        msg: error.message,
                        type: 'danger'
                    })
                });
            $scope.tags.sort(ignoreCase);
        });
    };
    //opnes delete modal for tag d
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
            tagService.deleteTag(t.name).then(
                //success
                function (response) {
                    for (i in $scope.tags) {
                        if (t.name == $scope.tags[i].name) {
                            $scope.tags.splice(i, 1)
                            $scope.alerts.push({
                                msg: "Tag deleted",
                                type: 'success'
                            })
                        }
                    }
                },
                //error
                function (response) {
                    $scope.alerts.push({
                        msg: 'Problem communicating',
                        type: 'danger'
                    })
                    $log.error('Failure')
                });
        });
    };
    //opens update modal for tag t
    $scope.update = function (t) {
        $log.log(t);
        var nameTemp = t.name;
        var modalInstance = $uibModal.open({
            templateUrl: 'tagUpdate.html',
            controller: 'TagUpdateModalCtrl',
            size: 'lg',
            resolve: {
                tag: function () {
                    return t;
                }
            }
        });
        //executes changes (or carries unchanged values through)
        modalInstance.result.then(function (input) {
            //update tags on backend then ui
            tagService.updateTag(nameTemp, input).then(
                //success callback
                function (resp) {
                    //update correct tag entry
                    for (i in $scope.tags) {
                        if (nameTemp == $scope.tags[i].name) {
                            $scope.tags[i].name = input.name;
                            $scope.tags[i].description = input.description;
                        }
                    }
                },
                //error callback
                function (error) {
                    $scope.alerts.push({
                        msg: error.message,
                        type: 'danger'
                    })
                });
        });
    };
});
//controller for an instance of addTagModal
tags.controller('AddTagModalInstanceCtrl', function ($scope, $uibModalInstance, $log) {
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
//controller for instance of TagUpdateModal
tags.controller('TagUpdateModalCtrl', function ($scope, $uibModalInstance, $log, tag) {
    $scope.tag = tag;
    //gets input from user
    $scope.input = {
        name: tag.name,
        description: tag.description
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
//controller for instance of TagDeleteModal
tags.controller('TagDeleteModalCtrl', function ($scope, $uibModalInstance, $log, tag) {
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
