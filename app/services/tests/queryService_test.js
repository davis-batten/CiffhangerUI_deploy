describe("query service", function () {
    var Service, httpBackend, baseUrl, $q;

    test_build_resp = {
        data: "SELECT * FROM table;",
        status: "Success"
    }


    beforeEach(function () {

        angular.mock.module("cliffhanger.queries");

        inject(function ($injector, $httpBackend) {
            queryService = $injector.get('queryService');
            httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
            baseUrl = ($injector.get('$rootScope')).baseUrl;
        });
    });

    it("should be able to build a query", function () {
        httpBackend.expectPOST(baseUrl + '/query/build').respond({
            data: test_build_resp.data,
            status: test_build_resp.status
        });
        queryService.buildQuery().then(function (response) {
            expect(response).toEqual(test_build_resp);
        });
    });

});
