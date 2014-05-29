define(["consumers", "dataValuesConsumer", "consumerRegistry"], function(consumers, dataValuesConsumer, consumerRegistry) {
    describe("consumers", function() {
        var app;
        beforeEach(function() {
            app = {
                "service": jasmine.createSpy()
            };
        });
        it("should register consumers with angular", function() {
            consumers.init(app);
            expect(app.service).toHaveBeenCalledWith("dataValuesConsumer", ["dataService", "dataRepository", "dataSetRepository", "userPreferenceRepository", "$q", "approvalService", dataValuesConsumer]);
            expect(app.service).toHaveBeenCalledWith("consumerRegistry", ["$hustle", "$q", "dataValuesConsumer", consumerRegistry]);
        });
    })
})