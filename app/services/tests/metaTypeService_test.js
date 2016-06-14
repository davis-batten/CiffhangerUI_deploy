describe("metaType service", function () {
    var metaTypeService, httpBackend, baseUrl, $q;

    test_get_data = [
        {
            name: "SSN",
            description: "social securtiy number"
        },
        {
            name: "ZIP",
            description: "zip code"
        }
    ];

    test_create_data = {
        name: "NAME",
        description: "first middle last"
    }


    beforeEach(function () {

        angular.mock.module("cliffhanger.metaTypes");

        inject(function ($injector, $httpBackend) {
            metaTypeService = $injector.get('metaTypeService');
            httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
            baseUrl = ($injector.get('$rootScope')).baseUrl;
        });
    });

    it("should be able to get all metatypes", function () {
        httpBackend.whenGET(baseUrl + '/metaType/list').respond({
            data: test_get_data
        });
        metaTypeService.getAllMetaTypes().then(function (response) {
            expect(response).toEqual(test_get_data);
        });
    });

    it("should be able to create a metatype", function () {
        httpBackend.expectPOST(baseUrl + '/metaType/create').respond(200, "success");
        metaTypeService.addMetaType(test_create_data);
        //httpBackend.flush();
    })

    //TODO add test for '/dataset/get/$name' when it is implemented fully
});
