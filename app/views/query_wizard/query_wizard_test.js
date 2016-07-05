describe('cliffhanger.queries module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ngSanitize'));
    beforeEach(angular.mock.module('ngCsv'));
    beforeEach(angular.mock.module('cliffhanger.queries'));
    describe('query wizard controller', function () {
        beforeEach(inject(function ($controller, $rootScope, $log, queryService, $q) {
            scope = $rootScope.$new();
            mockQueryService = queryService;
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
                        }
                        , {
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
                        }
                        , {
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
                        }
                        , {
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
                        }
                        , {
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
                        }
                        , {
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
                        }
                        , {
                            "name": "COUNTRY"
                        }
                    ]
                    }
                ];
            serviceError = false;
            //mock queryService methods
            spyOn(mockQueryService, "runQuery").and.callFake(function () {
                var bad_result = {
                    status: 'Error'
                }
                var testTableResult = {
                    colCount: 2,
                    colNames: [
                        "test.col1"
                        , "test.col2"
                    ],
                    rows: [
                        [
                            1
                            , "abc"
                        ]
                        , [
                            2
                            , "def"
                        ]
                        , [
                            3
                            , "ghi"
                        ]
                    ]
                }
                var deferred = $q.defer();
                if (serviceError) deferred.reject(bad_result);
                else deferred.resolve(testTableResult); //TODO add tableResult to here
                return deferred.promise;
            })
            spyOn(mockQueryService, "buildQuery").and.callFake(function () {
                var bad_result = {
                    status: 'Error'
                }
                var good_result = {
                    data: "SELECT * FROM table;",
                    status: 'Success'
                }
                var deferred = $q.defer();
                if (serviceError) deferred.resolve(bad_result);
                else deferred.resolve(good_result);
                return deferred.promise;
            })
            queryWizardCtrl = $controller('QueryWizardCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                datasets: mockDatasets,
                queryService: mockQueryService
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
        /*
        it('should close the modal with submit', function () {
            //This test will always fail because scope.submit is not implemented
            scope.submit();
            expect(scope.query).not.toBeNull();
            expect(modalInstance.close).toHaveBeenCalled();
        });
        */
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
            scope.statement = {};
            scope.query = "SELECT * FROM table;";
            scope.statement.where = "assaults = 10";
            scope.statement.limit = "100";
            scope.addToQuery();
            expect(scope.statement.text).not.toBeNull();
            expect(scope.statement.text).toEqual("\nWHERE assaults = 10\nLIMIT 100;");
        });
        it('should be able to add a WHERE clause without a LIMIT clause', function () {
            scope.statement = {};
            scope.query = "SELECT * FROM table;";
            scope.statement.where = "assaults = 10";
            scope.statement.limit = null;
            scope.addToQuery();
            expect(scope.statement.text).not.toBeNull();
            expect(scope.statement.text).toEqual("\nWHERE assaults = 10;");
        });
        it('should be able to add a LIMIT clause without a WHERE clause', function () {
            scope.statement = {};
            scope.query = "SELECT * FROM table;";
            scope.statement.where = null;
            scope.statement.limit = "110";
            scope.addToQuery();
            expect(scope.statement.text).not.toBeNull();
            expect(scope.statement.text).toEqual("\nLIMIT 110;");
        });
        it('should be able to add a WHERE/LIMIT clause and then change it', function () {
            scope.statement = {};
            scope.query = "SELECT * FROM table;";
            scope.statement.where = "assaults = 10";
            scope.statement.limit = "100";
            scope.addToQuery();
            expect(scope.statement.text).not.toBeNull();
            expect(scope.statement.text).toEqual("\nWHERE assaults = 10\nLIMIT 100;");
            scope.statement.where = "assaults > 0";
            scope.statement.limit = "20";
            scope.addToQuery();
            expect(scope.statement.text).not.toBeNull();
            expect(scope.statement.text).toEqual("\nWHERE assaults > 0\nLIMIT 20;");
        });
        //step 4 - query compilation step
        it('should show a green progress bar on the build query step', function () {
            serviceError = false;
            scope.step = scope.maxSteps - 2;
            scope.next();
            scope.$apply();
            expect(scope.progressType).toBe('success');
        });
        it('should correctly build SQL query on the build query step', function () {
            scope.step = scope.maxSteps - 2;
            scope.next();
            scope.$apply();
            expect(scope.query).toEqual('SELECT * FROM table;');
        });
        it('should show a red progress bar in the event of an error', function () {
            serviceError = true;
            scope.step = scope.maxSteps - 2;
            scope.next();
            scope.$apply();
            expect(scope.progressType).toBe('danger');
        });
        //step 5 - show results step
        it('should show a complete progress bar on the last step', function () {
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.progressType).toBe('success');
        });
        it('should run the query and return a table result object', function () {
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.tableResult).not.toBeNull();
            expect(scope.tableResult.colCount).toEqual(2);
            expect(scope.tableResult.colNames[1]).toBe("test.col2");
            expect(scope.tableResult.rows[0][1]).toBe("abc");
        });
        it('should show a red progress bar in the event of an error', function () {
            serviceError = true;
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.progressType).toBe('danger');
        });
        it('should run save query without where and limit clause', function () {
            scope.query = "SELECT * FROM table";
            scope.statement = undefined;
            scope.newQuery = {};
            scope.newQuery.name = "Test Query";
            scope.newQuery.description = "test query description";
            scope.save(scope.newQuery);
            expect(scope.newQuery).not.toBeNull();
            expect(scope.newQuery.name).toEqual("Test Query");
            expect(scope.newQuery.description).toEqual("test query description");
            expect(scope.newQuery.sqlString).toEqual("SELECT * FROM table");
        });
        it('should run save query with a where and limit clause', function () {
            scope.query = "SELECT * FROM table";
            scope.statement = {};
            scope.statement.text = " WHERE * > 10";
            scope.newQuery = {};
            scope.newQuery.name = "Test Query";
            scope.newQuery.description = "test query description";
            scope.save(scope.newQuery);
            expect(scope.newQuery).not.toBeNull();
            expect(scope.newQuery.name).toEqual("Test Query");
            expect(scope.newQuery.description).toEqual("test query description");
            expect(scope.newQuery.sqlString).toEqual("SELECT * FROM table WHERE * > 10");
        });
    });
});
