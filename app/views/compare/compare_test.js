describe('cliffhanger.compare module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.compare'));

    describe('compare controller', function () {

        it('should load', inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            var compareCtrl = $controller('CompareCtrl', {
                $scope: scope
            });
            expect(compareCtrl).toBeDefined();

        }));

    });
});
