describe('cliffhanger.queries module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ngSanitize'));
    beforeEach(angular.mock.module('ngCsv'));
    beforeEach(angular.mock.module('cliffhanger.queries'));
    describe('queries controller', function () {
        beforeEach(inject(function ($controller, $rootScope, _$log_, queryService, $q) {
            scope = $rootScope.$new();
            mockQueryService = queryService;
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close')
                , dismiss: jasmine.createSpy('uibModalInstance.dismiss')
                , result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            serviceError = false;
            //mock queryService methods
            spyOn(mockQueryService, "runQuery").and.callFake(function () {
                var bad_result = {
                    status: 'Error'
                }
                var testTableResult = {
                    colCount: 2
                    , colNames: [
                        "test.col1"
                        , "test.col2"
                    ]
                    , rows: [
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
                    data: "SELECT * FROM table;"
                    , status: 'Success'
                }
                var deferred = $q.defer();
                if (serviceError) deferred.resolve(bad_result);
                else deferred.resolve(good_result);
                return deferred.promise;
            })
            queriesCtrl = $controller('QueriesCtrl', {
                $scope: scope
                , $uibModalInstance: modalInstance
                , queryService: mockQueryService
            })
        }));
        // -----------Modal operations----------------------
        it('should instantiate the QueriesCtrl controller', function () {
            expect(queriesCtrl).not.toBeUndefined();
        });
        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });
        it('should advance to the next step', function () {
            scope.next();
            expect(scope.step).toBe(2);
        });
        it('should be able to go back to the previous step', function () {
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
        //step 2 - show results step
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
    });
});