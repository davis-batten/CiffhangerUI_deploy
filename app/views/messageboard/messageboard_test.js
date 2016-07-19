describe('cliffhanger.messageboard module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.issue'));
    beforeEach(angular.mock.module('cliffhanger.messageboard'));
    var scope, root, location, issues;
    describe('messageboard controller', function () {
        beforeEach(inject(function ($controller, $rootScope, $log, $q, $location, $uibModal, issueService) {
            scope = $rootScope.$new();
            root = $rootScope;
            location = $location;
            modal = $uibModal;
            serviceError = false;
            //test data
            issues = [
                {
                    threadId: 1
                    , subject: "Can't load table cliffhanger.testHiveTable"
                    , opener: {
                        username: "dbatt"
                        , role: {
                            roleID: "DEVELOPER"
                        }
                    }
                    , numComments: 5
                    , createDate: new Date()
                    , open: true
                }
                    , {
                    threadId: 2
                    , subject: "Can't change username"
                    , opener: {
                        username: "colton"
                        , role: {
                            roleID: "ADMIN"
                        }
                    }
                    , numComments: 1
                    , createDate: new Date()
                    , open: false
                }
                    , {
                    threadId: 3
                    , subject: "No results for a join query"
                    , opener: {
                        username: "heather"
                        , role: {
                            roleID: "ANALYST"
                        }
                    }
                    , numComments: 3
                    , createDate: new Date()
                    , open: true
                }
            ];
            //mock issueService
            spyOn(issueService, "getAllIssues").and.callFake(function () {
                var deferred = $q.defer();
                if (!serviceError) {
                    var goodResponse = {
                        status: 'Success'
                        , data: issues
                    }
                    deferred.resolve(goodResponse);
                }
                else {
                    var badResponse = {
                        status: 'Error'
                        , data: "Could not load issues"
                    }
                    deferred.resolve(badResponse);
                }
                return deferred.promise;
            })
            msgCtrl = $controller('MessageBoardCtrl', {
                $scope: scope
                , $log: $log
                , $q: $q
                , $rootScope: root
                , $location: location
                , $uibModal: modal
                , issueService: issueService
            });
        }));
        it('should be able to load all issue discussion threads', function () {
            scope.$apply();
            expect(scope.issues).toBeDefined();
            expect(scope.issues).toEqual(issues);
        });
        it('should be able to view an issue thread', function () {
            scope.$apply();
            scope.openThread(scope.issues[0]);
            expect(scope.issues[0].threadId).toBe(1);
            expect(location.path()).toBe('/issue/1');
        });
        //TODO test filters
        //TODO test role/open styling
    });
    //TODO test new issue
    describe('NewIssueModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close')
                , dismiss: jasmine.createSpy('uibModalInstance.dismiss')
                , result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            newIssueModalCtrl = $controller('NewIssueModalInstanceCtrl', {
                $scope: scope
                , $uibModalInstance: modalInstance
            });
        }));
        it('should instantiate the newIssueModalInstanceCtrl controller', function () {
            expect(newIssueModalCtrl).not.toBeUndefined();
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
    });
});