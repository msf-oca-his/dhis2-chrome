define(["idbUtils", "httpTestUtils", "testData", "lodash"], function(idbUtils, http, testData, _) {
    describe("sync data values", function() {
        var hustle;

        beforeEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
            hustle = dhis.injector.get("$hustle");
        });

        it("should upload datavalues when there is no conflicts", function(done) {
            var orgUnitId = "e3e286c6ca8";
            var period = "2014W28";
            var datasetId = "a170b8cd5e5";
            var idbData = testData.uploadDataValuesIDBPayload;

            var setupData = function() {
                return idbUtils.upsert("dataValues", idbData);
            };

            var clearIDB = function() {
                return idbUtils.clear("dataValues");
            };

            var publishHustle = function() {
                var hustleData = {
                    "dataValues": [{
                        "period": period,
                        "orgUnit": orgUnitId
                    }]
                };

                return hustle.publish({
                    "data": hustleData,
                    "type": "uploadDataValues"
                }, "dataValues");
            };

            var getValuesFromDHIS = function() {
                var params = {
                    "orgUnit": orgUnitId,
                    "children": true,
                    "dataSet": datasetId,
                    "period": period
                };
                return http.GET("/api/dataValueSets.json", params);
            };

            var verify = function(dataFromDHIS) {
                var dataValuesFromIDB = idbData.dataValues;
                var dataValuesFromDHIS = dataFromDHIS.dataValues;

                var findCorrespondingDhisDV = function(dvFromIDB) {
                    return _.find(dataValuesFromDHIS, {
                        'dataElement': dvFromIDB.dataElement,
                        'categoryOptionCombo': dvFromIDB.categoryOptionCombo,
                        'attributeOptionCombo': dvFromIDB.attributeOptionCombo
                    });
                };

                _.forEach(dataValuesFromIDB, function(dvFromIDB) {
                    var dvFromDHIS = findCorrespondingDhisDV(dvFromIDB);
                    expect(dvFromDHIS).not.toBeUndefined();
                    expect(dvFromDHIS.value).toEqual(dvFromIDB.value);
                });
            };

            var testThisScenario = function() {
                var onSuccess = function(data) {
                    verify(data.data);
                    clearIDB();
                    done();
                };
                var onError = function() {
                    clearIDB();
                    expect(undefined).toBeDefined();
                    done();
                };
                setupData().then(publishHustle).then(function() {
                    setTimeout(function() {
                        getValuesFromDHIS().then(onSuccess, onError);
                    }, 8000);
                });
            };

            testThisScenario();
        });
    });
});
