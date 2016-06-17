describe('cliffhanger.tags module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));

    beforeEach(angular.mock.module('cliffhanger.tags'));

    describe('TagCtrl', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, $log, $uibModal) {
            scope = $rootScope.$new();
            modal = $uibModal;


            //create mock tagService
            mockTagService = {
                addTag: function () {
                    //TODO
                    return $q.resolve();
                },
                getTag: function () {
                    //TODO
                    return $q.resolve();
                },
                getAllTags: function () {
                    //TODO
                    return $q.resolve();
                }
            }

            tagCtrl = $controller('TagCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                datasetService: mockDatasetService,
                tagService: mockTagService,

            });
        }));

        it('should have a TagCtrl controller', function () {
            expect(tagCtrl).toBeDefined();
        });
    });

    describe('AddTagModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            addTagModalCtrl = $controller('AddTagModalInstanceCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log
            });

        }));

        it('should instantiate the addTagModalInstanceCtrl controller', function () {
            expect(addTagModalCtrl).not.toBeUndefined();
        });

        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

        it('should close the modal with submit', function () {
            scope.submit();
            expect(scope.input).not.toBeNull();
            expect(modalInstance.close).toHaveBeenCalled();
        });

        it('should be able to add a tag', function () {
            var before = scope.input.tag.length;
            scope.meta_type = {
                meta_name: 'ZIP',
                description: 'zip code'
            }

            scope.addTag();
            //expect one more attribute in list
            expect(scope.input.meta_type.length - before).toBe(1);
        });

        //        it('should be able to remove a tag', function () {
        //
        //            //add new meta type
        //            scope.tag = {
        //                meta_name: 'ZIP',
        //                description: 'zip code'
        //            }
        //
        //            scope.addTag();
        //            var before = scope.input.tag.length;
        //
        //            //remove and test
        //            scope.removeTag(0);
        //            //expect one less attribute in list
        //            expect(scope.input.tag.length - before).toBe(-1);
        //        })
    });

    //    describe('MetaDataInfoModalCtrl', function () {
    //        beforeEach(inject(function ($controller, $rootScope, $log) {
    //            scope = $rootScope.$new();
    //            modalInstance = {
    //                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
    //                result: {
    //                    then: jasmine.createSpy('uibModalInstance.result.then')
    //                }
    //            };
    //            mockTag = {
    //                name: 'test',
    //                description: 'desc'
    //            }
    //
    //            tagInfoCtrl = $controller('TagInfoModalCtrl', {
    //                $scope: scope,
    //                $uibModalInstance: modalInstance,
    //                $log: $log,
    //                tag: mockTag
    //            });
    //
    //        }));
    //
    //        it('should be able close the modal', function () {
    //            scope.close();
    //            expect(modalInstance.dismiss).toHaveBeenCalledWith('close');
    //        });
    //    });
});
