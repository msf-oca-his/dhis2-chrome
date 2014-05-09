define(["idb", "httpWrapper", "Q", "lodash", "properties"], function(idb, httpWrapper, Q, _, properties) {
    var sync = function() {
        var openDb = function() {
            return idb.openDb("msf");
        };

        var getLastUpdatedTime = function() {
            return idb.get("changeLog", "metaData");
        };

        var getMetadata = function(metadataChangeLog) {
            var lastUpdatedTimeQueryString = metadataChangeLog ? "?lastUpdated=" + metadataChangeLog.lastUpdatedTime : "";
            var url = properties.dhis.url + "/api/metaData" + lastUpdatedTimeQueryString;

            console.debug("Fetching " + url);
            return httpWrapper.get(url);
        };

        var upsertMetadata = function(data) {
            console.debug("Processing metadata ", data);
            var syncableTypes = properties.metadata.types;
            var putData = function(transaction) {
                var putRequests = [];
                _.each(syncableTypes, function(type) {
                    var entities = data[type] || [];
                    console.debug("Storing ", type, entities.length);
                    _.each(entities, function(entity) {
                        var putRequest = idb.put(type, entity, transaction);
                        putRequests.push(putRequest);
                    });
                });
                return Q.all(putRequests).then(function() {
                    return data;
                });
            };

            return idb.usingTransaction(syncableTypes, putData);
        };

        var getSystemSettings = function() {
            var url = properties.dhis.url + "/api/systemSettings";
            console.debug("Fetching " + url);
            return httpWrapper.get(url);
        };

        var upsertSystemSettings = function(data) {
            console.debug("Processing system settings ", data);
            var type = "systemSettings";
            var putData = function(transaction) {
                var projectIds = _.keys(data);
                var entities = _.map(projectIds, function(projectId) {
                    return JSON.parse(data[projectId]);
                });
                console.debug("Storing ", type, entities.length);
                _.each(entities, function(entity) {
                    var putRequest = idb.put(type, entity, transaction);
                    return putRequest.then(function() {
                        return data;
                    });
                });
            };

            return idb.usingTransaction(type, putData);
        };

        var updateChangeLog = function(data) {
            var createdDate = new Date(data.created);
            return idb.put("changeLog", {
                type: 'metaData',
                lastUpdatedTime: createdDate.toISOString()
            });
        };

        return openDb()
            .then(getLastUpdatedTime)
            .then(getMetadata)
            .then(upsertMetadata)
            .then(updateChangeLog)
            .then(getSystemSettings)
            .then(upsertSystemSettings)
            .then(function() {
                console.log("Metadata sync complete");
            });
    };

    return {
        "sync": sync
    };
});