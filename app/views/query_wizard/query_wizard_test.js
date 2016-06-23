describe('cliffhanger.query_wizard module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.query_wizard'));

    describe('query wizard controller', function () {

        beforeEach(inject(function ($controller, $rootScope, $log) {
            scope = $rootScope.$new();
            modalInstance = {
                close: jasmine.createSpy('uibModalInstance.close'),
                dismiss: jasmine.createSpy('uibModalInstance.dismiss'),
                result: {
                    then: jasmine.createSpy('uibModalInstance.result.then')
                }
            };
            queryWizardCtrl = $controller('QueryWizardCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance
            });

        }));

        it('should instantiate the addTagModalInstanceCtrl controller', function () {
            expect(queryWizardCtrl).not.toBeUndefined();
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
    });
});
