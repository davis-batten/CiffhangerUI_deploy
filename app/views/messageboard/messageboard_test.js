describe('cliffhanger.messageboard module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('cliffhanger.issue'));
    beforeEach(angular.mock.module('cliffhanger.messageboard'));

    var scope, root, location, issues;

    describe('messageboard controller', function () {

        beforeEach(inject(function ($controller, $rootScope, $log, $q, $location, issueService) {
            scope = $rootScope.$new();
            root = $rootScope;
            location = $location;

            serviceError = false;

            //test data
            issues = [
                {
                    threadId: 1,
                    subject: "Can't load table cliffhanger.testHiveTable",
                    opener: {
                        username: "dbatt",
                        role: {
                            roleID: "DEVELOPER"
                        }
                    },
                    numComments: 5,
                    createDate: new Date(),
                    open: true
                },
                {
                    threadId: 2,
                    subject: "Can't change username",
                    opener: {
                        username: "colton",
                        role: {
                            roleID: "ADMIN"
                        }
                    },
                    numComments: 1,
                    createDate: new Date(),
                    open: false
                },
                {
                    threadId: 3,
                    subject: "No results for a join query",
                    opener: {
                        username: "heather",
                        role: {
                            roleID: "ANALYST"
                        }
                    },
                    numComments: 3,
                    createDate: new Date(),
                    open: true
                }
            ]

            //mock issueService
            spyOn(issueService, "getAllIssues").and.callFake(function () {
                var deferred = $q.defer();
                if (!serviceError) {
                    var goodResponse = {
                        status: 'Success',
                        data: issues
                    }
                    deferred.resolve(goodResponse);
                } else {
                    var badResponse = {
                        status: 'Error',
                        data: "Could not load issues"
                    }
                    deferred.resolve(badResponse);
                }
                return deferred.promise;
            })

            msgCtrl = $controller('MessageBoardCtrl', {
                $scope: scope,
                $log: $log,
                $q: $q,
                $rootScope: root,
                $location: location,
                issueService: issueService
            });

        }));

        it('should be able to load all issue discussion threads', function () {
            scope.$apply();
            expect(scope.issues).toBeDefined();
            expect(scope.issues).toEqual(issues);
        })


        it('should be able to view an issue thread', function () {
            scope.$apply();
            scope.openThread(scope.issues[0]);
            expect(scope.issues[0].threadId).toBe(1);
            expect(location.path()).toBe('/issue/1');
        })


        //TODO test filters

        //TODO test role/open styling

        //TODO test new issue


    });

});
