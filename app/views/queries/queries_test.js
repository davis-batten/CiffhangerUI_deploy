describe('cliffhanger.queries module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.queries'));

    describe('queries controller', function () {

        it('should load', inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            var queriesCtrl = $controller('QueriesCtrl', {
                $scope: scope
            });
            expect(queriesCtrl).toBeDefined();

        }));

    });
});
