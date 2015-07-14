define(["lodash"], function(_) {
    return function(chartService, chartRepository, userPreferenceRepository, datasetRepository, $q) {
        var userModules;
        this.run = function(message) {

            var loadUserModuleIds = function() {
                return userPreferenceRepository.getUserModuleIds().then(function(userModuleIds) {
                    userModules = userModuleIds;
                    return userModuleIds;
                });
            };

            var loadRelevantDatasets = function(moduleIds) {
                return datasetRepository.findAllForOrgUnits(moduleIds);
            };

            var loadChartData = function(datasets) {
                return chartService.getAllFieldAppChartsForDataset(datasets);
            };

            var saveCharts = function(charts) {
                return chartRepository.upsert(charts).then(function(data){
                    return charts;
                });
            };

            var saveChartData = function(charts) {
                return _.forEach(userModules, function(userModule) {
                    return _.forEach(charts, function(chart) {
                        return chartService.getChartDataForOrgUnit(chart, userModule).then(function(data) {
                            return chartRepository.upsertChartData(chart.name, userModule, data);
                        });
                    });
                });
            };

            return loadUserModuleIds().then(loadRelevantDatasets).then(loadChartData).then(saveCharts).then(saveChartData);

        };
    };
});