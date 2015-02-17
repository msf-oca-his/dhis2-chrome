define(["angularMocks", "utils", "moment", "metadataImporter", "metadataService", "systemSettingService", "systemSettingRepository", "changeLogRepository", "metadataRepository", "orgUnitRepository", "orgUnitGroupRepository", "datasetRepository", "programRepository"],
    function(mocks, utils, moment, MetadataImporter, MetadataService, SystemSettingService, SystemSettingRepository, ChangeLogRepository, MetadataRepository, OrgUnitRepository, OrgUnitGroupRepository, DatasetRepository, ProgramRepository) {
        describe("metadataImporter", function() {
            var q, scope, metadataImporter, metadataService, systemSettingService, systemSettingRepository, changeLogRepository, metadataRepository, orgUnitRepository, orgUnitGroupRepository, datasetRepository, programRepository;

            beforeEach(mocks.inject(function($q, $rootScope) {
                q = $q;
                scope = $rootScope.$new();

                changeLogRepository = {
                    "get": jasmine.createSpy("get").and.returnValue(utils.getPromise(q, undefined)),
                    "upsert": jasmine.createSpy("upsert")
                };

                metadataService = new MetadataService();
                metadataRepository = new MetadataRepository();
                orgUnitRepository = new OrgUnitRepository();
                orgUnitGroupRepository = new OrgUnitGroupRepository();
                programRepository = new ProgramRepository();
                datasetRepository = new ProgramRepository();
                systemSettingService = new SystemSettingService();
                systemSettingRepository = new SystemSettingRepository();

                metadataImporter = new MetadataImporter(q, metadataService, systemSettingService, systemSettingRepository, changeLogRepository, metadataRepository, orgUnitRepository, orgUnitGroupRepository, datasetRepository, programRepository);
            }));

            it("should import metadata for fresh installations", function() {
                var orgUnits = [{
                    'id': 'ou1'
                }];
                var orgUnitGroups = [{
                    'id': 'oug1'
                }];
                var dataSets = [{
                    'id': 'ds1'
                }];
                var programs = [{
                    'id': 'prog1'
                }];
                var metadataCreateDate = moment().toISOString();
                var dhisMetadata = {
                    'created': metadataCreateDate,
                    'organisationUnits': orgUnits,
                    'organisationUnitGroups': orgUnitGroups,
                    "dataSets": dataSets,
                    'programs': programs
                };

                spyOn(metadataService, "loadMetadataFromFile").and.returnValue(utils.getPromise(q, dhisMetadata));
                spyOn(metadataRepository, "upsertMetadata");
                spyOn(orgUnitRepository, "upsertDhisDownloadedData");
                spyOn(orgUnitGroupRepository, "upsertDhisDownloadedData");
                spyOn(datasetRepository, "upsertDhisDownloadedData");
                spyOn(programRepository, "upsertDhisDownloadedData");

                metadataImporter.run();
                scope.$apply();

                expect(metadataService.loadMetadataFromFile).toHaveBeenCalled();
                expect(metadataRepository.upsertMetadata).toHaveBeenCalledWith(dhisMetadata);
                expect(orgUnitRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(orgUnits);
                expect(orgUnitGroupRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(orgUnitGroups);
                expect(datasetRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(dataSets);
                expect(programRepository.upsertDhisDownloadedData).toHaveBeenCalledWith(programs);
                expect(changeLogRepository.upsert).toHaveBeenCalledWith("metaData", metadataCreateDate);
            });

            it("should not run import if run once before", function() {
                changeLogRepository.get.and.returnValue(utils.getPromise(q, moment().toISOString()));
                spyOn(metadataService, "loadMetadataFromFile");
                spyOn(metadataRepository, "upsertMetadata");
                spyOn(orgUnitRepository, "upsertDhisDownloadedData");
                spyOn(orgUnitGroupRepository, "upsertDhisDownloadedData");
                spyOn(datasetRepository, "upsertDhisDownloadedData");
                spyOn(programRepository, "upsertDhisDownloadedData");

                metadataImporter.run();
                scope.$apply();

                expect(metadataService.loadMetadataFromFile).not.toHaveBeenCalled();
                expect(metadataRepository.upsertMetadata).not.toHaveBeenCalled();
                expect(orgUnitRepository.upsertDhisDownloadedData).not.toHaveBeenCalled();
                expect(orgUnitGroupRepository.upsertDhisDownloadedData).not.toHaveBeenCalled();
                expect(datasetRepository.upsertDhisDownloadedData).not.toHaveBeenCalled();
                expect(programRepository.upsertDhisDownloadedData).not.toHaveBeenCalled();
                expect(changeLogRepository.upsert).not.toHaveBeenCalled();
            });
        });
    });