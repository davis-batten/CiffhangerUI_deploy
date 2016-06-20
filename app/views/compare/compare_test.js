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

            scope.tags = [
                {
                    name: "ZIP",
                    description: "zipcode"
            },
                {
                    name: "SSN",
                    description: "social security number"
            }];
            scope.datasets = [{
                name: "abc"
        }, {
                name: "def"
        }];
        }));

        it('should load', function () {
            expect(compareCtrl).toBeDefined();

        });

        it('should be able to add <EMPTY>', function () {
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
            spyOn(scope, 'updateTable');
            scope.selectedTags.push({
                name: 'stuff',
                description: 'test'
            });
            scope.$digest();
            expect(scope.updateTable).toHaveBeenCalled();
        });

        it('should be able to select/deselect all tags', function () {
            expect(scope.tags.length).not.toBe(0);
            expect(scope.selectedTags.length).toBe(0);
            scope.selectAllTags(); //scope.tags.length = 2
            expect(scope.selectedTags.length).toBe(2);
            scope.deselectAllTags();
            expect(scope.selectedTags.length).toBe(0);
        });

        it('should be able to select/deselect all datasets', function () {
            expect(scope.datasets.length).not.toBe(0);
            expect(scope.selectedDatasets.length).toBe(0);
            scope.selectAllDatasets(); //scope.datasets.length = 2
            expect(scope.selectedDatasets.length).toBe(2);
            scope.deselectAllDatasets();
            expect(scope.selectedDatasets.length).toBe(0);
        });

        it('should be able to filter tags', function () {
            scope.filterTags("ZI").then(function (resp) {
                expect(resp).toBe({
                    name: "ZIP",
                    description: "zipcode"
                });
            })
        });

        it('should be able to filter datasets', function () {
            scope.filterTags("a").then(function (resp) {
                expect(resp).toBe({
                    name: "abc"
                });
            })
        });


        describe('buildRow test', function () {
            var dataset;
            beforeEach(function () {
                scope.selectAllTags();
                dataset = {
                    name: 'DataSet1',
                    desc: 'desc1',
                    attributes: [
                        {
                            col_name: 'zippy',
                            tag: {
                                name: 'ZIP',
                                description: 'zip code'
                            }

                        },
                        {
                            col_name: 'legal_name',
                            tag: {
                                name: 'NAME',
                                description: 'name'
                            }
                        }
                    ]
                }
                scope.rows = [];
            });

            it("should add a cell for matched tags", function () {
                scope.buildRow(dataset);
                expect(scope.rows[dataset.name][0]).toEqual({
                    name: 'zippy',
                    type: {
                        name: 'ZIP',
                        description: 'zipcode'
                    },
                    class: 'success'
                });
            });

            it("should add empty cells for unmatched tags", function () {
                scope.buildRow(dataset);
                expect(scope.rows[dataset.name][1]).toEqual({
                    name: null,
                    type: {
                        name: 'SSN',
                        description: 'social security number'
                    },
                    class: 'danger'
                });

            });

        });
    });
});
