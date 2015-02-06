define(["downloadDatasetConsumer", "datasetService", "utils", "angularMocks", "datasetRepository"],
    function(DownloadDatasetConsumer, DatasetService, utils, mocks, DatasetRepository) {
        xdescribe("download dataset consumer", function() {
            var scope, q, datasetService, datasetRepository, downloadDatasetConsumer;

            beforeEach(mocks.inject(function($q, $rootScope) {
                q = $q;
                scope = $rootScope.$new();

                datasetService = new DatasetService();
                datasetRepository = new DatasetRepository();
            }));

            it("should save new dataset from dhis into the local repo", function() {
                var dhisDatasets = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000'
                }];

                spyOn(datasetRepository, 'upsert');
                spyOn(datasetRepository, 'upsertDhisDownloadedData');
                spyOn(datasetRepository, 'findAll').and.returnValue(utils.getPromise(q, []));
                spyOn(datasetService, 'getAll').and.returnValue(utils.getPromise(q, dhisDatasets));

                var message = {
                    'data': {
                        'data': [],
                        'type': 'downloadDataset'
                    },
                    'created': '2015-01-02T09:00:00.000+0000'
                };

                downloadDatasetConsumer = new DownloadDatasetConsumer(datasetService, datasetRepository, q);
                downloadDatasetConsumer.run(message);
                scope.$apply();

                expect(datasetRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(dhisDatasets[0]);
            });

            it("should overwrite local dataset with dhis copy when dataset is newer in dhis", function() {
                var localDataset = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': []
                }];

                var dhisDatasets = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000',
                    'organisationUnits': []
                }];

                spyOn(datasetRepository, 'upsertDhisDownloadedData');
                spyOn(datasetRepository, 'findAll').and.returnValue(utils.getPromise(q, localDataset));
                spyOn(datasetService, 'getAll').and.returnValue(utils.getPromise(q, dhisDatasets));

                var message = {
                    'data': {
                        'data': [],
                        'type': 'downloadDataset'
                    },
                    'created': '2015-01-02T09:00:00.000+0000'
                };

                downloadDatasetConsumer = new DownloadDatasetConsumer(datasetService, datasetRepository, q);
                downloadDatasetConsumer.run(message);
                scope.$apply();

                var expectedUpsertedDataset = {
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000',
                    'organisationUnits': []
                };

                expect(datasetRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(expectedUpsertedDataset);
            });

            it("should merge local dataset with dhis copy when new orgunits are associated to the dataset either in dhis or locally", function() {
                var localDataset = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1'
                    }, {
                        'id': 'ou3'
                    }]
                }];

                var dhisDatasets = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou2'
                    }, {
                        'id': 'ou1'
                    }]
                }];

                spyOn(datasetRepository, 'upsert');
                spyOn(datasetRepository, 'upsertDhisDownloadedData');
                spyOn(datasetRepository, 'findAll').and.returnValue(utils.getPromise(q, localDataset));
                spyOn(datasetService, 'getAll').and.returnValue(utils.getPromise(q, dhisDatasets));

                var message = {
                    'data': {
                        'data': [],
                        'type': 'downloadDataset'
                    },
                    'created': '2015-01-02T09:00:00.000+0000'
                };

                downloadDatasetConsumer = new DownloadDatasetConsumer(datasetService, datasetRepository, q);
                downloadDatasetConsumer.run(message);
                scope.$apply();

                var expectedUpsertedDataset = {
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1'
                    }, {
                        'id': 'ou2'
                    }, {
                        'id': 'ou3'
                    }]
                };
                expect(datasetRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(expectedUpsertedDataset);
            });

            it("should retain the local dataset when the dataset or the orgunits associated to it are newer than dhis", function() {

                var dhisDatasets = [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1',
                        'lastUpdated': '2015-01-01T09:00:00.000+0000'
                    }]
                }, {
                    'id': 'ds2',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1',
                        'lastUpdated': '2015-01-01T09:00:00.000+0000'
                    }]
                }];

                spyOn(datasetRepository, 'upsertDhisDownloadedData');
                spyOn(datasetRepository, 'findAll').and.returnValue(utils.getPromise(q, [{
                    'id': 'ds1',
                    'lastUpdated': '2015-01-01T10:00:00.000+0000',
                    'clientLastUpdated': '2015-01-01T11:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1',
                        'lastUpdated': '2015-01-01T09:00:00.000+0000'
                    }]
                }, {
                    'id': 'ds2',
                    'lastUpdated': '2015-01-01T09:00:00.000+0000',
                    'clientLastUpdated': '2015-01-01T11:00:00.000+0000',
                    'organisationUnits': [{
                        'id': 'ou1',
                        'lastUpdated': '2015-01-01T10:00:00.000+0000'
                    }]
                }]));

                spyOn(datasetService, 'getAll').and.returnValue(utils.getPromise(q, dhisDatasets));

                var message = {
                    'data': {
                        'data': [],
                        'type': 'downloadDataset'
                    },
                    'created': '2015-01-02T09:00:00.000+0000'
                };

                downloadDatasetConsumer = new DownloadDatasetConsumer(datasetService, datasetRepository, q);
                downloadDatasetConsumer.run(message);
                scope.$apply();

                expect(datasetRepository.upsertDhisDownloadedData).toHaveBeenCalledWith([]);
            });
        });
    });
