describe('cliffhanger.tags module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.tags'));

    describe('TagCtrl', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, _$log_, $uibModal, tagService) {
            $rootScope.user = {
                username: "test"
            }

            scope = $rootScope.$new();
            modal = $uibModal;
            root = $rootScope;
            root.theme = {}
            $log = _$log_;

            test_tag_data = [
                {
                    name: "test1",
                    description: "test1 desc"
                },
                {
                    name: "test2",
                    description: "test2 desc"
                }
            ];

            test_create_tag = {
                name: 'test3',
                description: 'test3 desc'
            }

            deferred = $q.defer();

            resp = {};

            spyOn(tagService, 'getAllTags').and.callFake(function () {
                resp.data = test_tag_data;
                resp.status = "Success";
                deferred.resolve(resp);
                return deferred.promise;
            });

            tagCtrl = $controller('TagCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                $rootScope: root,
                tagService: tagService

            });
        }));

        it('should have a TagCtrl controller', function () {
            expect(tagCtrl).toBeDefined();
        });

        it('should be able to load the tags', function () {
            scope.$apply();
            expect(scope.tags).not.toBe(undefined);
            expect(scope.tags).toEqual(test_tag_data);
        });


        afterEach(function () {
            //console.log($log.debug.logs);
        });
    });

    describe('AddTagModalInstanceCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            addTagModalCtrl = $controller('AddTagModalInstanceCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance
            });

        }));

        it('should instantiate the addTagModalInstanceCtrl controller', function () {
            expect(addTagModalCtrl).not.toBeUndefined();
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
