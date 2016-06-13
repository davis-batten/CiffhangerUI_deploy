describe('cliffhanger.compare module', function () {

    beforeEach(module('ngRoute'));

    beforeEach(module('cliffhanger.compare'));

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
