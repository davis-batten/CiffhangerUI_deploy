describe('cliffhanger.compare module', function () {

    beforeEach(angular.mock.module('ngRoute'));

    beforeEach(angular.mock.module('cliffhanger.compare'));

    describe('compare controller', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, $log, $filter) {
            scope = $rootScope.$new();

            //create mock datasetService
            mockDatasetService = {
                getAllDatasets: function () {
                    var testResponse = {
                        data: [],
                        status: "Success"
                    }
                    return $q.resolve(testResponse);
                }
            };
            //create mock tagService
            mockTagService = {
                getAllTags: function () {
                    var testResponse = {
                        data: [],
                        status: "Success"
                    }
                    return $q.resolve(testResponse);
                }
            };

            compareCtrl = $controller('CompareCtrl', {
                $scope: scope,
                $log: $log,
                $q: $q,
                $filter: $filter,
                tagService: mockTagService,
                datasetService: mockDatasetService
            });

            scope.testInital();
        }));

        it('should load', function () {
            expect(compareCtrl).toBeDefined();

        });

        it('should be able to add <EMPTY>', function () {
            scope.testInital();
            scope.allowUntagged();
            var found = false;
            for (i in scope.selectedTags) {
                if (scope.selectedTags[i].name == "<EMPTY>") {
                    found = true;
                }
            }
            expect(found).toBeTruthy();

        });

        it('should be able to remove <EMPTY>', function () {
            scope.testInital();
            scope.allowUntagged();
            var found = false;

            scope.removeUntagged();
            for (i in scope.selectedTags) {
                if (scope.selectedTags[i].name == "<EMPTY>") {
                    found = true;
                }
            }
            expect(found).not.toBeTruthy();
        });

        it('should update table rows when filter changes', function () {
            spyOn(scope, 'buildRow');
            scope.testInital();
            scope.selectedTags.push({
                name: 'stuff',
                description: 'test'
            });
            scope.$digest();
            expect(scope.buildRow).toHaveBeenCalled();
        })



    });
});
