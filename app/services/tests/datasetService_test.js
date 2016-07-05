describe("dataset service", function () {
    var datasetService, httpBackend, baseUrl, $q;

    test_get_data = [
        {
            name: "test",
            description: "test desc",
            attributes: []
        }
    ];

    test_create_data = {
        name: "new",
        description: "new description",
        attributes: []
    }


    beforeEach(function () {

        angular.mock.module("cliffhanger.datasets");

        inject(function ($injector, $httpBackend) {
            datasetService = $injector.get('datasetService');
            httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
            baseUrl = ($injector.get('$rootScope')).baseUrl;
        });
    });

    it("should be able to get all datasets", function () {
        httpBackend.whenGET(baseUrl + '/dataset/list').respond({
            data: test_get_data
        });
        datasetService.getAllDatasets().then(function (response) {
            expect(response).toEqual(test_get_data);
        });
    });

    it("should be able to create a dataset", function () {
        httpBackend.expectPOST(baseUrl + '/dataset/create').respond(200, "success");
        datasetService.addDataset(test_create_data);
        //httpBackend.flush();
    })

    it("should be able to delete a dataset", function () {
        var datasetName = test_create_data.name;
        httpBackend.expectDELETE(baseUrl + '/dataset/delete/' + datasetName).respond(200, "success");
        datasetService.deleteDataset(test_create_data);
        //httpBackend.flush();
    })

    it("should be able to update a dataset", function () {
        var datasetName = test_create_data.name;
        httpBackend.expectPUT(baseUrl + '/dataset/update/' + datasetName).respond(200, "success");
        datasetService.updateDataset(test_create_data);
        //httpBackend.flush();
    })

    //TODO add test for '/dataset/get/$name' when it is implemented fully
});
