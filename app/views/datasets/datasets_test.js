describe('cliffhanger.datasets module', function () {
    beforeEach(module('ngRoute'));
    beforeEach(module('ui.bootstrap'));
    beforeEach(module('cliffhanger.datasets'));
    describe('DatasetsCtrl', function () {
        var baseScope;
        beforeEach(inject(function ($controller, $rootScope, $q, $log, $uibModal, datasetService) {
            scope = $rootScope.$new();
            baseScope = scope;
            root = $rootScope;
            root.theme = {}
            modal = $uibModal;
            service = datasetService;
            old_dataset_data = [
                {
                    name: 'old 1',
                    description: 'old desc 1',
                    attributes: []
                }, {
                    name: 'old 2',
                    description: 'old desc 2',
                    attributes: []
                }
            ];
            updated_dataset_data = {
                name: 'new name',
                description: 'new desc',
                db_table_name: 'new table name',
                attributes: []
            }
            deferred = $q.defer();
            resp = {};
            spyOn(service, 'getAllDatasets').and.callFake(function () {
                resp.data = old_dataset_data;
                resp.status = "Success";
                deferred.resolve(resp.data);
                return deferred.promise;
            });
            spyOn(service, 'updateDataset').and.callFake(function () {
                resp.data = updated_dataset_data;
                resp.status = "Success";
                deferred.resolve(resp.data);
                return deferred.promise;
            });
            datasetsCtrl = $controller('DatasetsCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                $rootScope: root,
                datasetService: service
            });
            mockUser = {
                username: "mockUser",
                password: "nnnnnnn",
                role: {
                    roleID: 'ADMIN'
                }
            }
            $rootScope.user = mockUser;
        }));
        it('should have a DatasetsCtrl controller', function () {
            expect(datasetsCtrl).toBeDefined();
        });
    });
    describe('AddDatasetModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log, $q) {
            scope = $rootScope.$new();
            mockUser = {
                username: "mockUser",
                password: "nnnnnnn",
                role: {
                    roleID: 'ADMIN'
                }
            }
            $rootScope.user = mockUser;
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
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
            addDatasetModalCtrl = $controller('AddDatasetModalInstanceCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log,
                tagService: mockTagService
            });

        }));
        it('should instantiate the addDatasetModalInstanceCtrl controller', function () {
            expect(addDatasetModalCtrl).not.toBeUndefined();
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
        it('should advance to the 2nd step', function () {
            scope.next();
            expect(scope.step).toBe(2);
        });
        it('should be able to go back to the previous step', function () {
            scope.next();
            scope.previous();
            expect(scope.step).toBe(1);
        });
        it('should be able to add an attribute', function () {
            var before = scope.input.attributes.length;
            scope.newAttribute = {
                col_name: 'test',
                description: 'test desc',
                data_type: 'String',
                meta_type: {
                    meta_name: 'ZIP',
                    description: 'zip code'
                }
            }
            scope.addAttr();
            //expect one more attribute in list
            expect(scope.input.attributes.length - before).toBe(1);
        });
        it('show show/hide tables in a database when database is clicked', function () {
            expect(scope.input.db_table_name).toEqual("");
            // TODO
        });
        it('should be able to select and show a table from database explorer and be able to remove it', function () {
            expect(scope.input.db_table_name).toEqual("");
            // TODO
        });
        it('should show loading animation when importing column data from hive and should display imported columns correctly', function () {
            // TODO
        });
    });
    describe('DatasetUpdateModalCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log, $q) {
            scope = $rootScope.$new();
            modalInstance = {
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                close: jasmine.createSpy('uibModalInstance.close'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            mockTag = {
                name: 'test tag to remove',
                description: 'test tag desc'
            };
            mockDataset = {
                name: 'test',
                description: 'desc',
                db_table_name: '',
                attributes: [
                    {
                        col_name: 'test_col1',
                        description: 'test attr 1 desc',
                        data_type: 'String',
                        tag: {
                            name: '<EMPTY>',
                            description: ''
                        }
                    }
                    , {
                        col_name: 'test_col2',
                        description: 'test attr 2 desc',
                        data_type: 'String',
                        tag: mockTag
                    }
                ]
            };
            //create mock datasetService
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
            datasetUpdateCtrl = $controller('DatasetUpdateModalCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log,
                dataset: mockDataset,
                tagService: mockTagService
            });
        }));
        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });
        it('should be able to complete and close the modal', function () {
            scope.complete();
            expect(scope.input).not.toBeNull();
            expect(modalInstance.close).toHaveBeenCalled();
        });
        it('should be able to add a tag to an attribute', function () {
            scope.replaceTag(0, mockTag);
            expect(mockDataset.attributes[0].tag).toBe(mockTag);
        });
        it('should be able to remove a tag from an attribute', function () {
            scope.removeTag(1);
            expect(mockDataset.attributes[1].tag.name).toBe('<EMPTY>');
            expect(mockDataset.attributes[1].tag.description).toBe('');
        });
    });
    describe('DatasetPreviewModalCtrl', function () {
        var mockDatasetService;
        var modalInstance;
        beforeEach(inject(function ($controller, $rootScope, $log, $q, datasetService) {
            scope = $rootScope.$new();
            modalInstance = {
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                close: jasmine.createSpy('uibModalInstance.close'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            }
            mockDataset = {
                name: 'test',
                description: 'desc',
                db_table_name: 'testTable',
                attributes: [
                    {
                        col_name: 'col1',
                        data_type: 'int',
                    }
                ]
            }
            mockDatasetService = datasetService;
            spyOn(mockDatasetService, "previewDataset").and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            })
            datasetPreviewCtrl = $controller('DatasetPreviewModalCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log,
                dataset: mockDataset,
                datasetService: mockDatasetService
            });

        }));

        it('should have a DatasetPreviewCtrl controller', function () {
            expect(datasetPreviewCtrl).toBeDefined();
        });

        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

        it('should load the preview of the dataset', function () {
            scope.$apply();
            expect(mockDatasetService.previewDataset).toHaveBeenCalled
        });
    })

    describe('DatasetDeleteModalCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                close: jasmine.createSpy('uibModalInstance.close'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            mockDataset = {
                name: 'test',
                description: 'desc',
                attributes: []
            };
            datasetDeleteCtrl = $controller('DatasetDeleteModalCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                $log: $log,
                dataset: mockDataset
            });
            mockUser = {
                username: "mockUser",
                password: "nnnnnnn",
                role: {
                    roleID: 'ADMIN'
                }
            }
            $rootScope.user = mockUser;
        }));
        it('should be able accept and close the modal', function () {
            scope.delete();
            expect(modalInstance.close).toHaveBeenCalledWith(mockDataset);
        });
        it('should be able to cancel and dismiss the modal', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalled();
        });
    });
});
