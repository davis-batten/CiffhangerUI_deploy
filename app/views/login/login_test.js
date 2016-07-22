describe('cliffhanger.users module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('cliffhanger.users'));
    beforeEach(angular.mock.module('cliffhanger.superuser'));
    var scope, root, mockUserService, loginCtrl, location;
    describe('LoginCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $location, $q, $log, userService) {
            scope = $rootScope.$new();
            root = $rootScope;
            location = $location;
            mockUserService = userService;
            scope.alerts = [];
            //create mockUserService spies
            serviceError = false;
            spyOn(mockUserService, 'login').and.callFake(function () {
                //TODO
                var deferred = $q.defer();
                if (!serviceError) {
                    var user = {
                        username: 'testUsername'
                        , password: 'testPassword'
                        , roles: [
                        'ROLE_DEVELOPER'
                    ]
                    }
                    var response = {
                        data: user
                        , status: 'Success'
                    }
                    deferred.resolve(response);
                    root.user = user;
                    root.$apply();
                }
                else {
                    var badResponse = {
                        data: 'Unsuccessful login!'
                        , status: 'Error'
                    }
                    deferred.resolve(badResponse);
                }
                return deferred.promise;
            });
            spyOn(mockUserService, 'register').and.callFake(function () {
                //TODO
                var deferred = $q.defer();
                if (!serviceError) {
                    var user = {
                        username: 'testUsername'
                        , password: 'testPassword'
                        , roles: [
                        'ROLE_DEVELOPER'
                    ]
                    }
                    var response = {
                        data: user
                        , status: 'Success'
                    }
                    deferred.resolve(response);
                }
                else {
                    var badResponse = {
                        data: 'Unsuccessful register!'
                        , status: 'Error'
                    }
                    deferred.resolve(badResponse);
                }
                return deferred.promise;
            });
            loginCtrl = $controller('LoginCtrl', {
                $scope: scope
                , $rootScope: root
                , userService: mockUserService
                , $location: location
            });
        }));
        it('should be defined', function () {
            expect(loginCtrl).toBeDefined();
        })
        it('should be able to login', function () {
            root.$apply();
            scope.login();
            scope.$apply();
            expect(mockUserService.login).toHaveBeenCalled();
            expect(root.theme.color).toBe('green');
            expect(location.path()).toBe('/developer/datasets');
        })
        it('should display alert if failed to login', function () {
            serviceError = true;
            scope.login();
            scope.$apply();
            expect(mockUserService.login).toHaveBeenCalled();
            expect(scope.alerts[0]).toEqual('Unsuccessful login!');
            expect(root.theme.color).not.toBe('green');
            expect(location.path()).not.toBe('/developer/datasets');
        })
        it('should be able to register a new user', function () {
            spyOn(scope, 'login');
            scope.register();
            scope.$apply();
            expect(mockUserService.register).toHaveBeenCalled();
            expect(scope.login).toHaveBeenCalled();
        })
        it('should display alert if failed to register a new user', function () {
            spyOn(scope, 'login');
            serviceError = true;
            scope.register();
            scope.$apply();
            expect(mockUserService.register).toHaveBeenCalled();
            expect(scope.login).not.toHaveBeenCalled();
            expect(scope.alerts[0]).toEqual('Unsuccessful register!');
        })
    })
})