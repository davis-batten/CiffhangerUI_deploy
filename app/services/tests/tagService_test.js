describe("tag service", function () {
    var tagService, httpBackend, baseUrl, $q;

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

        angular.mock.module("cliffhanger.tags");

        inject(function ($injector, $httpBackend) {
            tagService = $injector.get('tagService');
            httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
            baseUrl = ($injector.get('$rootScope')).baseUrl;
        });
    });

    it("should be able to get all tags", function () {
        httpBackend.whenGET(baseUrl + '/tag/list').respond({
            data: test_get_data
        });
        tagService.getAllTags().then(function (response) {
            expect(response).toEqual(test_get_data);
        });
    });

    it("should be able to create a tag", function () {
        httpBackend.expectPOST(baseUrl + '/tag/create').respond(200, "success");
        tagService.addTag(test_create_data);
        //httpBackend.flush();
    });

    it("should be able to update a tag", function () {
        httpBackend.expectPUT(baseUrl + '/tag/update/' + test_create_data.name).respond(200, "success");
        tagService.updateTag(test_create_data.name, test_create_data);
    });

});
