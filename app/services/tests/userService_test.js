describe("user service", function () {
    var userService, httpBackend, baseUrl, $q, root;

    beforeEach(angular.mock.module('cliffhanger.superuser'));
    beforeEach(angular.mock.module('cliffhanger.users'));

    beforeEach(function () {
        angular.mock.module("cliffhanger.superuser");
        inject(function ($injector, $httpBackend) {
            userService = $injector.get("userService");
            httpBackend = $injector.get("$httpBackend");
            $q = $injector.get("$q");
            root = $injector.get("$rootScope");
            baseUrl = ($injector.get("$rootScope")).baseUrl;
        });
    });

    it("should be able to login a user", function () {
        var user = {
            username: 'test',
            password: 'password',
        }
        httpBackend.expect('POST', baseUrl + '/user/login', user).respond(200);
        userService.login();
    });

    it("should be able to create a user", function () {
        var newUser = {
            username: 'test2',
            password: 'password',
            role: {
                roleID: 'ANALYST'
            }
        }

        httpBackend.expect('POST', baseUrl + '/user/create', newUser).respond(200);
        userService.register()
    });

    it("should be able to logout a user", function () {
        userService.logout();
        expect(root.user).toEqual({});
    })



});