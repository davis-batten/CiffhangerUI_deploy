describe('cliffhanger.tags module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.tags'));

    describe('TagCtrl', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, _$log_, $uibModal, tagService) {
            scope = $rootScope.$new();
            modal = $uibModal;
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

            deferred = $q.defer();

            spyOn(tagService, 'getAllTags').and.callFake(function () {
                deferred.resolve(test_tag_data);
                scope.defere
                return deferred.promise;
            });

            //create mock tagService
            mockTagService = {
                addTag: function (tag) {
                    var deferred = $q.defer();
                    var tags = angular.copy(test_tag_data).push(tag)
                    resp.data = tags;
                    deferred.resolve(resp);
                    return deferred.promise;
                },
                getTag: function () {
                    var deferred = $q.defer();
                    resp.data = test_tag_data[0]
                    deferred.resolve(resp);
                    return deferred.promise;
                },
                getAllTags: function () {
                    return deferred.promise;
                }
            }

            tagCtrl = $controller('TagCtrl', {
                $scope: scope,
                $uibModal: modal,
                $log: $log,
                tagService: tagService,

            });
        }));

        it('should have a TagCtrl controller', function () {
            expect(tagCtrl).toBeDefined();
        });

        it('should be able to load the tags', function () {
            //deferred.resolve(test_tag_data);
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
