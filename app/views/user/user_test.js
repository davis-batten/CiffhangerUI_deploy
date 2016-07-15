describe('cliffhanger.superuser module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.superuser'));
    beforeEach(angular.mock.module('cliffhanger.users'));

    describe('UsersCtrl', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, _$log_, $uibModal, userService) {
            scope = $rootScope.$new();
            modal = $uibModal;
            root = $rootScope;
            root.theme = {}
            $log = _$log_;

            test_user_data = [
                {
                    username: 'Juan',
                    password: 'JuanDirection',
                    role: {
                        roleID: 'DEVELOPER'
                    }
                },
                {
                    username: 'Ben',
                    password: 'Jammin',
                    role: {
                        roleID: 'ANALYST'
                    }
                }
            ]

            test_create_user = {
                name: 'Heather',
                description: 'MasterCommander',
                role: {
                    roleID: "ANALYST"
                }
            }

            deferred = $q.defer();

            resp = {};

            spyOn(userService, 'getAllUsers').and.callFake(function () {
                resp.data = test_user_data;
                resp.status = "Success";
                deferred.resolve(resp);
                return deferred.promise;
            });

            userCtrl = $controller('UsersCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                $rootScope: root,
                userService: userService

            });
        }));

        it('should have a UsersCtrl controller', function () {
            expect(userCtrl).toBeDefined();
        });

        it('should be able to load the users', function () {
            scope.$apply();
            expect(scope.userList).not.toBe(undefined);
            expect(scope.userList).toEqual(test_user_data);
        });


        afterEach(function () {
            //console.log($log.debug.logs);
        });
    });

    describe('UpdateUserModalCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope2 = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            updateUserModalCtrl = $controller('UpdateUserModalCtrl', {
                $scope: scope2,
                $uibModalInstance: modalInstance,
                user: test_create_user
            });

        }));

        it('should instantiate the UpdateUserModalCtrl controller', function () {
            expect(updateUserModalCtrl).not.toBeUndefined();
        });

        it('should dismiss the modal with cancel', function () {
            scope2.cancel();
            expect(modalInstance.dismiss).toHaveBeenCalledWith('cancel');
        });

        it('should close the modal with submit', function () {
            scope2.complete();
            expect(scope2.input).not.toBeNull();
            expect(modalInstance.close).toHaveBeenCalled();
        });

    });

});