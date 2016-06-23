describe('cliffhanger.query_wizard module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.query_wizard'));

    describe('query wizard controller', function () {

        it('should load', inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            var queryWizCtrl = $controller('QueryWizardCtrl', {
                $scope: scope
            });
            expect(queryWizCtrl).toBeDefined();

        }));

    });
});
