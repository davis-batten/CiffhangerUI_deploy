describe('cliffhanger.query_wizard module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.query_wizard'));

    describe('query wizard controller', function () {

        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };

            mockDatasets = [
                {
                    name: 'test1',
                    description: 'test desc 1',
                    attributes: [
                        {
                            "name": "attr1",
                            "tag": {
                                "name": "ZIP"
                            }
                        },
                        {
                            "name": "attr2",
                            "tag": {
                                "name": "SSN"
                            }
                        }
                    ],
                    selected: true,
                    tags: [
                        {
                            "name": "ZIP"
                        },
                        {
                            "name": "SSN"
                        }
                    ]
                    }, {
                    name: 'test2',
                    description: 'test desc 2',
                    attributes: [
                        {
                            "name": "attr3",
                            "tag": {
                                "name": "ZIP"
                            }
                        },
                        {
                            "name": "attr4",
                            "tag": {
                                "name": "NAME"
                            }
                        }
                    ],
                    selected: true,
                    tags: [
                        {
                            "name": "ZIP"
                        },
                        {
                            "name": "NAME"
                        }
                    ]
                    }, {
                    name: 'test3',
                    description: 'test desc 3',
                    attributes: [
                        {
                            "name": "attr4",
                            "tag": {
                                "name": "COUNTY"
                            }
                        },
                        {
                            "name": "attr5",
                            "tag": {
                                "name": "COUNTRY"
                            }
                        }
                    ],
                    selected: false,
                    tags: [
                        {
                            "name": "COUNTY"
                        },
                        {
                            "name": "COUNTRY"
                        }
                    ]
                    }
                ];
            queryWizardCtrl = $controller('QueryWizardCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                datasets: mockDatasets
            })

        }));


        // -----------Modal operations----------------------

        it('should instantiate the QueryWizardCtrl controller', function () {
            expect(queryWizardCtrl).not.toBeUndefined();
        });

        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

        it('should close the modal with submit', function () {
            scope.submit();
            expect(scope.query).not.toBeNull();
            expect(modalInstance.close).toHaveBeenCalled();
        });

        it('should advance to the next step', function () {
            scope.selectedDatasets = mockDatasets;
            scope.next();
            expect(scope.step).toBe(2);
        });

        it('should be able to go back to the previous step', function () {
            scope.selectedDatasets = mockDatasets;
            scope.next();
            scope.previous();
            expect(scope.step).toBe(1);
            expect(scope.progressType).toBeNull();
        });

        //-------------Step Specific Tests-----------------

        //step 1 - dataset select
        it('should handle changes linked to checkboxes', function () {
            var myArr = [];
            scope.change(scope.datasets[0], myArr);
            expect(myArr.length).toBe(1);
            scope.datasets[0].selected = false;
            scope.change(scope.datasets[0], myArr);
            expect(myArr.length).toBe(0);
        });

        //step 2 - join tag select
        it('should load the correct tags for the selected datasets', function () {
            scope.selectedDatasets = mockDatasets;
            scope.loadTags();
            expect(scope.tags).toEqual([
                {
                    "name": "ZIP"
                }
            ]);

        });

        //TODO test add WHERE and LIMIT clause
        it('should be able to add a WHERE/LIMIT clause to the query', function () {
            expect(scope.statement.text).toBe(); //TODO
        });

        //step 4 - completion step
        it('should show a complete progress bar on the last step', function () {
            scope.step = scope.maxSteps - 1;
            scope.next();
            expect(scope.progressType).toBe('success');
        });
    });
});
