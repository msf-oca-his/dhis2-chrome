define(["lodash", "moment"], function(_, moment) {
    return function(reportService, chartRepository, pivotTableRepository, userPreferenceRepository, datasetRepository, changeLogRepository, $q) {

        this.run = function(message) {

            var getLastDownloadedTime = function(userProjectIds) {
                return changeLogRepository.get("reports:" + userProjectIds.join(';'));
            };

            var updateChangeLog = function(userProjectIds) {
                return changeLogRepository.upsert("reports:" + userProjectIds.join(';'), moment().toISOString());
            };

            var loadUserProjectsAndModuleIds = function() {
                return userPreferenceRepository.getCurrentProjects().then(function(projects) {
                    return userPreferenceRepository.getUserModules().then(function(modules) {
                        return [_.pluck(projects, "id"), _.pluck(modules, "id")];
                    });
                });
            };

            var loadRelevantDatasets = function(userModuleIds) {
                return datasetRepository.findAllForOrgUnits(userModuleIds);
            };

            var downloadAndSaveChartData = function(userModuleIds, datasets) {

                var saveCharts = function(charts) {
                    return chartRepository.upsert(charts).then(function(data) {
                        return charts;
                    });
                };

                var saveChartData = function(charts) {
                    return _.forEach(userModuleIds, function(userModule) {
                        return _.forEach(charts, function(chart) {
                            return reportService.getReportDataForOrgUnit(chart, userModule).then(function(data) {
                                return chartRepository.upsertChartData(chart.name, userModule, data);
                            });
                        });
                    });
                };

                return reportService.getCharts(datasets)
                    .then(saveCharts)
                    .then(saveChartData);
            };

            var downloadAndSavePivotTableData = function(userModuleIds, datasets) {

                var savePivotTables = function(pivotTables) {
                    return pivotTableRepository.upsert(pivotTables).then(function(data) {
                        return pivotTables;
                    });
                };

                var savePivotTableData = function(pivotTables) {
                    return _.forEach(userModuleIds, function(userModule) {
                        return _.forEach(pivotTables, function(pivotTable) {
                            return reportService.getReportDataForOrgUnit(pivotTable, userModule).then(function(data) {
                                return pivotTableRepository.upsertPivotTableData(pivotTable.name, userModule, data);
                            });
                        });
                    });
                };

                return reportService.getPivotTables(datasets)
                    .then(savePivotTables)
                    .then(savePivotTableData);
            };

            return loadUserProjectsAndModuleIds().then(function(data) {
                var projectIds = data[0];
                var moduleIds = data[1];

                if (_.isEmpty(moduleIds))
                    return;

                return getLastDownloadedTime(projectIds).then(function(lastDownloadedTime) {

                    if (lastDownloadedTime && !moment().isAfter(lastDownloadedTime, 'day'))
                        return;

                    return loadRelevantDatasets(moduleIds).then(function(datasets) {
                        return $q.all([downloadAndSaveChartData(moduleIds, datasets), downloadAndSavePivotTableData(moduleIds, datasets)]).then(function() {
                            return updateChangeLog(projectIds);
                        });
                    });
                });
            });
        };
    };
});
