describe('cliffhanger.compare module', function () {

    beforeEach(angular.mock.module('ngRoute'));
    beforeEach(angular.mock.module('ui.bootstrap'));
    beforeEach(angular.mock.module('cliffhanger.compare'));

    describe('compare controller', function () {

        beforeEach(inject(function ($controller, $rootScope, $q, $log, $filter, $uibModal) {
            scope = $rootScope.$new();
            modal = $uibModal;

            root = $rootScope;
            root.theme = {}

            //create mock datasetService
            mockDatasetService = {
                getAllDatasets: function () {
                    var testResponse = {
                        data: [],
                        status: "Success"
                    };
                    return $q.resolve(testResponse);
                }
            };
            //create mock tagService
            mockTagService = {
                getAllTags: function () {
                    var testResponse = {
                        data: [],
                        status: "Success"
                    };
                    return $q.resolve(testResponse);
                }
            };

            compareCtrl = $controller('CompareCtrl', {
                $scope: scope,
                $log: $log,
                $q: $q,
                $filter: $filter,
                $rootScope: root,
                $uibModal: modal,
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
                name: 'abc',
                description: '',
                attributes: [
                    {
                        col_name: 'col_1',
                        description: '',
                        tag: {
                            name: 'ZIP',
                            description: 'zipcode'
                        }
                    },
                    {
                        col_name: 'col_2',
                        description: '',
                        tag: {
                            name: '<EMPTY>',
                            description: ''
                        }
                    }
                ],
                tags: [
                    {
                        name: 'ZIP',
                        description: 'zipcode'
                    },
                    {
                        name: '<EMPTY>',
                        description: ''
                    }
                ]
            }, {
                name: 'def',
                description: '',
                attributes: [],
                tags: []
        }];
        }));

        it('should load', function () {
            expect(compareCtrl).toBeDefined();

        });

        it('should be able to show and hide <EMPTY> column', function () {
            scope.allowUntagged();
            var found = false;
            for (var i in scope.matrix.columnDefs) {
                if (scope.matrix.columnDefs[i].field == "<EMPTY>") {
                    found = true;
                }
            }
            expect(found).toBeTruthy();
            
            scope.removeUntagged();
            found = false;
            for (var i in scope.matrix.columnDefs) {
                if (scope.matrix.columnDefs[i].field == "<EMPTY>") {
                    found = true;
                }
            }
            expect(found).toBeFalsy();

        });


        it('selecting a tag should add a column correctly and deselecting it should remove the correct column', function () {

            // Test adding a tag to matrix
            scope.selectDataset(scope.datasets[0]);
            scope.showTag({
                name: 'ZIP',
                description: 'zipcode'
            });
            var foundTag = false;
            for (var i in scope.matrix.columnDefs) {
                if (scope.matrix.columnDefs[i].field == 'ZIP') foundTag = true;
            }
            expect(foundTag).toBeTruthy();
            expect(scope.matrix.data[0].ZIP).toEqual("col_1");

            // Test removing a tag to matrix
            scope.hideTag({
                name: 'stuff',
                description: 'test'
            });
            var foundTag = false;
            for (var i in scope.matrix.columnDefs) {
                if (scope.matrix.columnDefs[i].field == 'stuff') foundTag = true;
            }
            expect(foundTag).toBeFalsy();
        });


        it('should be able to add all tags exactly once to the matrix and remove them all', function () {

            // test add all
            scope.selectAllTags();
            for (var i in scope.tags) {
                var tagIsAdded = false;
                for (var j in scope.matrix.columnDefs) {
                    if (scope.tags[i].name == scope.matrix.columnDefs[j].name) tagIsAdded = true;
                }
                expect(tagIsAdded).toBeTruthy();
            }
            expect(scope.matrix.columnDefs.length).toBe(scope.tags.length + 1);

            // test remove all
            scope.deselectAllTags();
            expect(scope.matrix.columnDefs.length).toBe(1);

        });

        it('should be able to add/remove all datasets to the matrix exactly once', function () {

            // test add all
            scope.selectAllDatasets();
            for (var i in scope.datasets) {
                var datasetIsAdded = false;
                for (var j in scope.matrix.data) {
                    if (scope.datasets[i].name == scope.matrix.data[j].datasetName) datasetIsAdded = true;
                }
                expect(datasetIsAdded).toBeTruthy();
            }
            expect(scope.matrix.data.length).toBe(scope.datasets.length)

            // test remove all
            scope.deselectAllDatasets();
            expect(scope.matrix.data.length).toBe(0)
        });

        it('should be able to add relevant datasets based on selected tags', function () {
            scope.selectedTags.push(scope.tags[0]);
            scope.showTag(scope.tags[0]);
            scope.selectRelevantDatasets();
            expect(scope.selectedDatasets.length).toBe(1);
            expect(scope.selectedDatasets[0].name).toEqual("abc");
            expect(scope.matrix.data.length).toBe(1);
            expect(scope.matrix.data[0].datasetName).toEqual("abc");
        });

        it('should be able to add relevant tags based on selected datasets', function () {
            scope.selectedDatasets.push(scope.datasets[0]);
            scope.selectDataset(scope.datasets[0]);
            scope.selectRelevantTags();
            expect(scope.selectedTags.length).toBe(1);
            var zipTagSelected = false;
            for (var i in scope.matrix.columnDefs) {
                if (scope.matrix.columnDefs[i].name == 'ZIP') zipTagSelected = true;

            }
            expect(scope.matrix.columnDefs.length).toBe(2);
            expect(zipTagSelected).toBeTruthy();
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

        it('should, on selectDataset, make a row of data with correctly formatted cells', function () {
            scope.selectAllTags();
            var dset = {
                name: 'abc',
                description: '',
                attributes: [
                    {
                        col_name: 'col_1',
                        description: '',
                        tag: {
                            name: 'ZIP',
                            description: 'zipcode'
                        }
                    },
                    {
                        col_name: 'col_2',
                        description: '',
                        tag: {
                            name: 'ZIP',
                            description: 'zipcode'
                        }
                    },
                    {
                        col_name: 'col_3',
                        description: '',
                        tag: {
                            name: '',
                            description: ''
                        }
                    }
                ]
            };
            scope.selectDataset(dset);
            expect(scope.matrix.data[0].datasetName).toEqual('abc');
            expect(scope.matrix.data[0].ZIP).toEqual("col_1, col_2");
            expect(scope.matrix.data[0].SSN).toEqual("");

        });


    });
});
