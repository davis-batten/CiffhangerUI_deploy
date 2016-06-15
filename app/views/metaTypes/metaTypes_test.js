describe('cliffhanger.metaTypes module', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('ui.bootstrap'));

    beforeEach(module('cliffhanger.metaTypes'));

    describe('MetaTypeCtrl', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, $log, $uibModal) {
            scope = $rootScope.$new();
            modal = $uibModal;

            //create mock datasetService
            mockDatasetService = {
                addDataset: function () {
                    //TODO
                    return $q.resolve();
                },
                getDataset: function () {
                    //TODO
                    return $q.resolve();
                },
                getAllDatasets: function () {
                    //TODO
                    return $q.resolve();
                }
            }

            //create mock metaTypeService
            mockMetaTypeService = {
                addMetaType: function () {
                    //TODO
                },
                getMetaType: function () {
                    //TODO
                },
                getAllMetaTypes: function () {
                    //TODO
                }
            }

            metaTypeCtrl = $controller('MetaTypeCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                datasetService: mockDatasetService,
                metaTypeService: mockMetaTypeService,

            });
        }));

        it('should have a MetaTypeCtrl controller', function () {
            expect(metaTypeCtrl).toBeDefined();
        });
    });

      describe('AddMetaTypeModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            addMetaTypeModalCtrl = $controller('AddMetaTypeModalInstanceCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log
            });

        }));

        it('should instantiate the addMetaTypeModalInstanceCtrl controller', function () {
            expect(addMetaTypeModalCtrl).not.toBeUndefined();
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

        it('should be able to add a Meta Type', function () {
            var before = scope.input.meta_type.length;
            scope.meta_type = {
                meta_name: 'ZIP',
                description: 'zip code'
            }

            scope.submit();
            //expect one more attribute in list
            expect(scope.input.meta_type.length - before).toBe(1);
        });

//        it('should be able to remove a Meta type', function () {
//
//            //add new meta type
//            scope.meta_type = {
//                meta_name: 'ZIP',
//                description: 'zip code'
//            }
//
//            scope.submit();
//            var before = scope.input.meta_type.length;
//
//            //remove and test
//            scope.removeMetaType(0);
//            //expect one less attribute in list
//            expect(scope.input.meta_type.length - before).toBe(-1);
//        })
//    });

    describe('MetaDataInfoModalCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            mockMetaData = {
                name: 'test',
                description: 'desc'
            }

            metaDataInfoCtrl = $controller('MetaDataInfoModalCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log,
                meta_data: mockMetaData
            });

        }));

        it('should be able close the modal', function () {
            scope.close();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('close');
        });
    });

});
