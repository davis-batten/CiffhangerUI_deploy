describe('cliffhanger.users module', function () {
    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('cliffhanger.users'));

    var scope, root, mockUserService, loginCtrl, location;
    describe('LoginCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $location, $q, $log, userService) {
            scope = $rootScope.$new();
            root = $rootScope;
            location = $location;
            mockUserService = userService;

            //create mockUserService spies
            serviceError = false;
            spyOn(mockUserService, 'login').and.callFake(function () {
                //TODO
                var deferred = $q.defer();

                if (!serviceError) {

                    var user = {
                        username: 'testUsername',
                        password: 'testPassword',
                        role: {
                            roleID: 'DEVELOPER'
                        }
                    }

                    var response = {
                        data: user,
                        status: 'Success'
                    }

                    deferred.resolve(response);
                    root.user = user;
                    root.$apply();
                } else {
                    var badResponse = {
                        data: 'Unsuccessful login',
                        status: 'Error'
                    }
                    deferred.resolve(badResponse);
                }
                return deferred.promise;
            });
            spyOn(mockUserService, 'register').and.callFake(function () {
                //TODO
            });

            loginCtrl = $controller('LoginCtrl', {
                $scope: scope,
                $rootScope: root,
                userService: mockUserService,
                $location: location
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


            expect(root.theme.color).not.toBe('green');
            expect(location.path()).not.toBe('/developer/datasets');
        })

    })
})
