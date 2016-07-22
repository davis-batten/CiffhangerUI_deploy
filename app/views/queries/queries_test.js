describe('cliffhanger.queries module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ngSanitize'));
    beforeEach(angular.mock.module('ngCsv'));
    beforeEach(angular.mock.module('cliffhanger.queries'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.issue'));
    var mockQuery;
    var mockQueryService;
    var test_query_data;
    var testDate = new Date();
    describe('QueriesCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $q, $log, $uibModal, queryService, issueService) {
            scope = $rootScope.$new();
            modal = $uibModal;
            root = $rootScope;
            root.theme = {}
            $log = $log;
            mockQueryService = queryService;
            mockIssueService = issueService;
            mockUser = {
                username: "mockUser"
                , password: "nnnnnnn"
                , roles: [
                    "ROLE_ADMIN"
                ]
            };
            $rootScope.user = mockUser;
            test_query_data = [
                {
                    id: "id1"
                    , name: "test1"
                    , description: "test1 desc"
                    , dateCreated: testDate
                    , sqlString: "SELECT * FROM table;"
                    , createdBy: "hdfs"
                }
                , {
                    id: "id2"
                    , name: "test2"
                    , description: "test2 desc"
                    , dateCreated: testDate
                    , sqlString: "SELECT * FROM table;"
                    , createdBy: "hdfs"
                }
            ];
            mockQuery = {
                id: "id3"
                , name: "test"
                , description: "desc"
                , dateCreated: testDate
                , sqlString: "SELECT * FROM table;"
                , createdBy: "hdfs"
            };
            deferred = $q.defer();
            resp = {};
            spyOn(mockQueryService, "getAllQueries").and.callFake(function () {
                resp.data = test_query_data;
                resp.status = "Success";
                deferred.resolve(resp);
                return deferred.promise;
            })
            serviceError = false;
            issueServiceError = false;
            emptyResult = false;
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
                var emptyTableResult = {
                    colCount: 2
                    , colNames: [
                        "test.col1"
                        , "test.col2"
                    ]
                    , rows: []
                }
                var deferred = $q.defer();
                if (serviceError) deferred.reject(bad_result);
                else if (emptyResult) deferred.resolve(emptyTableResult);
                else deferred.resolve(testTableResult);
                return deferred.promise;
            })
            spyOn(mockIssueService, "createIssue").and.callFake(function () {
                var bad_result = {
                    status: 'Error'
                }
                var good_result = {
                    status: 'Success'
                }
                var deferred = $q.defer();
                if (issueServiceError) deferred.reject(bad_result);
                else deferred.resolve(good_result);
                return deferred.promise;
            })
            queriesCtrl = $controller('QueriesCtrl', {
                $scope: scope
                , $uibModal: modal
                , $log: $log
                , $rootScope: root
                , queryService: mockQueryService
                , issueService: mockIssueService
            })
        }));
        it('should have a QueriesCtrl controller', function () {
            expect(queriesCtrl).toBeDefined();
        });
        it('should be able to load the queries', function () {
            scope.$apply();
            expect(scope.queryList).not.toBe(undefined);
            expect(scope.queryList).toEqual(test_query_data);
        });
        afterEach(function () {
            //console.log($log.debug.logs);
        });
    });
    describe('ViewQueryModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log, $q) {
            scope = $rootScope.$new();
            serviceError = false;
            issueServiceError = false;
            emptyResult = false;
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close')
                , dismiss: jasmine.createSpy('uibModalInstance.dismiss')
                , result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
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
                var emptyTableResult = {
                    colCount: 2
                    , colNames: [
                        "test.col1"
                        , "test.col2"
                    ]
                    , rows: []
                }
                var deferred = $q.defer();
                if (serviceError) deferred.reject(bad_result);
                else if (emptyResult) deferred.resolve(emptyTableResult);
                else deferred.resolve(testTableResult);
                return deferred.promise;
            })
            spyOn(mockIssueService, "createIssue").and.callFake(function () {
                var bad_result = {
                    status: 'Error'
                }
                var good_result = {
                    status: 'Success'
                }
                var deferred = $q.defer();
                if (issueServiceError) deferred.reject(bad_result);
                else deferred.resolve(good_result);
                return deferred.promise;
            })
            viewQueryModalCtrl = $controller('ViewQueryModalInstanceCtrl', {
                $scope: scope
                , $uibModalInstance: modalInstance
                , $log: $log
                , query: mockQuery
                , queryService: mockQueryService
                , issueService: mockIssueService
            });
        }));
        it('should instantiate the viewQueryModalInstanceCtrl controller', function () {
            expect(viewQueryModalCtrl).not.toBeUndefined();
        });
        it('should dismiss the modal with cancel', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
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
        it('should load the correct query', function () {
            scope.step = 1;
            expect(scope.query.sqlString).toEqual('SELECT * FROM table;');
            expect(scope.query.name).toEqual('test');
            expect(scope.query.dateCreated).toEqual(testDate);
        });
        it('should run the query and return a table result object', function () {
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.query.sqlString).toEqual('SELECT * FROM table;');
            expect(scope.tableResult).not.toBeNull();
            expect(scope.tableResult).toEqual({
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
            });
            expect(scope.tableResult.colCount).toEqual(2);
            expect(scope.tableResult.colNames[1]).toBe("test.col2");
            expect(scope.tableResult.rows[0][1]).toBe("abc");
        });
        it('should show proper warning modal content when results are empty and give ability to open new issue', function () {
            emptyResult = true;
            scope.step = 1;
            scope.next();
            scope.$apply();
            expect(mockQueryService.runQuery).toHaveBeenCalled();
            expect(scope.noResults).toBeTruthy();
            expect(scope.queryRanFine).toBeFalsy();
            scope.showNotifyDevsForm();
            expect(scope.shouldShowNotifyDevsForm).toBeTruthy();
            expect(scope.newProblemInput.body).not.toBeNull();
        });
        it('should show proper warning modal content when connection fails and give ability to open new discussion board', function () {
            serviceError = true;
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.connectionFailed).toBeTruthy();
            expect(scope.queryRanFine).toBeFalsy();
            scope.showNotifyDevsForm();
            expect(scope.shouldShowNotifyDevsForm).toBeTruthy();
            expect(scope.newProblemInput.body).not.toBeNull();
        });
        it('should show error message when new discussion board creation fails', function () {
            serviceError = true;
            scope.step = scope.maxSteps - 1;
            scope.next();
            scope.$apply();
            expect(scope.connectionFailed).toBeTruthy();
            expect(scope.queryRanFine).toBeFalsy();
            scope.showNotifyDevsForm();
            expect(scope.shouldShowNotifyDevsForm).toBeTruthy();
            expect(scope.newProblemInput.body).not.toBeNull();
        });
    });
    describe('QueryDeleteModalCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                dismiss: jasmine.createSpy('uibModalInstance.dismiss')
                , close: jasmine.createSpy('uibModalInstance.close')
                , result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            queryDeleteCtrl = $controller('QueryDeleteModalCtrl', {
                $scope: scope
                , $uibModalInstance: modalInstance
                , $log: $log
                , query: mockQuery
            });
        }));
        it('should be able accept and close the modal', function () {
            scope.delete();
            expect(modalInstance.close).toHaveBeenCalledWith(mockQuery);
        });
        it('should be able to cancel and dismiss the modal', function () {
            scope.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalled();
        });
    });
});