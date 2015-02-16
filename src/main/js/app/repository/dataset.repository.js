define(["lodash", "datasetTransformer", "moment"], function(_, datasetTransformer, moment) {
    return function(db, $q) {
        var get = function(datasetId) {
            var store = db.objectStore("dataSets");
            return store.find(datasetId);
        };

        var findAll = function(datasetIds) {
            var store = db.objectStore("dataSets");
            var query = db.queryBuilder().$in(datasetIds).compile();
            return store.each(query);
        };

        var getEnrichedDatasets = function(datasets, excludedDataElements) {
            var getEntitiesFromDb = function(storeName) {
                var store = db.objectStore(storeName);
                return store.getAll();
            };

            var sectionPromise = getEntitiesFromDb("sections");
            var dataElementsPromise = getEntitiesFromDb("dataElements");

            return $q.all([sectionPromise, dataElementsPromise]).then(function(data) {
                var sections = data[0];
                var dataElements = data[1];
                return datasetTransformer.enrichDatasets(datasets, sections, dataElements, excludedDataElements);
            });
        };

        var getAll = function() {
            var store = db.objectStore("dataSets");
            var filtered = store.getAll().then(function(all) {
                return _.filter(all, function(ds) {
                    var attr = _.find(ds.attributeValues, {
                        "attribute": {
                            "code": 'isNewDataModel'
                        }
                    });
                    return attr && attr.value === 'true';
                });
            });
            return filtered;
        };

        var getAllDatasetIds = function() {
            return getAll().then(function(data) {
                return _.pluck(data, "id");
            });
        };

        var getAllForOrgUnit = function(orgUnitId) {
            var store = db.objectStore("dataSets");
            var query = db.queryBuilder().$eq(orgUnitId).$index("by_organisationUnit").compile();
            return store.each(query);
        };

        var extractOrgUnitIdsForIndexing = function(dataSets) {
            return _.map(dataSets, function(ds) {
                ds.orgUnitIds = _.pluck(ds.organisationUnits, "id");
                return ds;
            });
        };

        var upsert = function(payload) {
            var dataSets = !_.isArray(payload) ? [payload] : payload;

            dataSets = _.map(dataSets, function(ds) {
                ds.clientLastUpdated = moment().toISOString();
                return ds;
            });

            dataSets = extractOrgUnitIdsForIndexing(dataSets);
            var store = db.objectStore("dataSets");
            return store.upsert(dataSets).then(function() {
                return dataSets;
            });
        };

        var upsertDhisDownloadedData = function(payload) {
            var dataSets = !_.isArray(payload) ? [payload] : payload;
            dataSets = extractOrgUnitIdsForIndexing(dataSets);
            var store = db.objectStore("dataSets");
            return store.upsert(dataSets).then(function() {
                return dataSets;
            });
        };

        return {
            "get": get,
            "findAll": findAll,
            "upsertDhisDownloadedData": upsertDhisDownloadedData,
            "getAll": getAll,
            "getAllDatasetIds": getAllDatasetIds,
            "upsert": upsert,
            "getAllForOrgUnit": getAllForOrgUnit,
            "getEnrichedDatasets": getEnrichedDatasets
        };
    };
});
