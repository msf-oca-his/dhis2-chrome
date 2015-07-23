define(["d3", "lodash", "moment", "saveSvgAsPng"], function(d3, _, moment) {
    return function($scope, $q, $routeParams, datasetRepository, orgUnitRepository, chartService, chartRepository) {

        $scope.barChartOptions = {
            "chart": {
                "type": "multiBarChart",
                "height": 450,
                "margin": {
                    "top": 20,
                    "right": 20,
                    "bottom": 60,
                    "left": 45
                },

                "clipEdge": true,
                "staggerLabels": false,
                "transitionDuration": 500,

                "x": function(d) {
                    return d.label;
                },
                "y": function(d) {
                    return d.value;
                },
                "xAxis": {
                    "axisLabel": "Period",
                    "tickFormat": function(d) {
                        return moment(d, 'GGGGWW').format('GGGG[W]W');
                    }
                },
                "yAxis": {
                    "tickFormat": function(d) {
                        return d3.format('.0f')(d);
                    }
                }
            }
        };
        $scope.stackedBarChartOptions = {
            "chart": {
                "type": "multiBarChart",
                "height": 450,
                "margin": {
                    "top": 20,
                    "right": 20,
                    "bottom": 60,
                    "left": 45
                },
                "stacked": true,
                "clipEdge": true,
                "staggerLabels": false,
                "transitionDuration": 500,

                "x": function(d) {
                    return d.label;
                },
                "y": function(d) {
                    return d.value;
                },
                "xAxis": {
                    "axisLabel": "Period",
                    "tickFormat": function(d) {
                        return moment(d, 'GGGGWW').format('GGGG[W]W');
                    }
                },
                "yAxis": {
                    "tickFormat": function(d) {
                        return d3.format('.0f')(d);
                    }
                }
            }
        };

        $scope.lineChartOptions = {
            "chart": {
                "type": "lineChart",
                "height": 450,

                "margin": {
                    "top": 20,
                    "right": 45,
                    "bottom": 60,
                    "left": 45
                },
                "useInteractiveGuideline": true,
                "x": function(d) {
                    return d.label;
                },
                "y": function(d) {
                    return d.value;
                },
                "xAxis": {
                    "axisLabel": "Period",
                    "tickFormat": function(d) {
                        return moment(d, 'GGGGWW').format('GGGG[W]W');
                    }
                },
                "yAxis": {
                    "tickFormat": function(d) {
                        return d3.format('.0f')(d);
                    }
                }
            }
        };


        $scope.downloadChartAsPng = function(event) {
            saveSvgAsPng(event.currentTarget.parentElement.parentElement.getElementsByTagName("svg")[0], "chart.png");
        };

        var loadChartData = function() {

            var insertMissingPeriods = function(chartData, periodsForXAxis) {
                _.each(chartData, function(chartDataForKey) {
                    var periodsWithData = _.reduce(chartDataForKey.values, function(result, data) {
                        result.push(data.label);
                        return result;
                    }, []);

                    var missingPeriods = _.difference(periodsForXAxis, periodsWithData);
                    _.each(missingPeriods, function(period) {
                        chartDataForKey.values.push({
                            "label": period,
                            "value": 0
                        });
                    });
                    chartDataForKey.values = _.sortBy(chartDataForKey.values, function(value) {
                        return value.label;
                    });
                });

                return chartData;
            };

            var getChartData = function(charts) {

                var transform = function(chart, chartData) {
                    var getName = function(id) {
                        return chartData.metaData.names[id];
                    };

                    var periodsForXAxis = _.reduce(chartData.metaData.pe, function(result, period) {
                        result.push(parseInt(moment(period, 'GGGG[W]W').format('GGGGWW')));
                        return result;
                    }, []);

                    var transformedChartData = _.transform(chartData.rows, function(result, row) {

                        var item = _.find(result, {
                            'key': getName(row[0])
                        });

                        if (item !== undefined) {
                            item.values.push({
                                "label": parseInt(moment(row[1], 'GGGG[W]W').format('GGGGWW')),
                                "value": parseInt(row[2])
                            });
                            return;
                        }

                        result.push({
                            "key": getName(row[0]),
                            "values": [{
                                "label": parseInt(moment(row[1], 'GGGG[W]W').format('GGGGWW')),
                                "value": parseInt(row[2])
                            }]
                        });
                    });

                    transformedChartData = insertMissingPeriods(transformedChartData, periodsForXAxis);

                    return {
                        "title": chart.title,
                        "dataset": chart.dataset,
                        "type": chart.type,
                        "data": transformedChartData
                    };
                };

                var getChartDataPromises = _.map(charts, function(chart) {
                    return chartRepository.getDataForChart(chart.name, $scope.orgUnit.id).then(function(chartData) {
                        if (!_.isEmpty(chartData))
                            return transform(chart, chartData);
                    });
                });

                return $q.all(getChartDataPromises);
            };

            return chartService.getAllFieldAppChartsForDataset($scope.datasets)
                .then(getChartData)
                .then(function(chartData) {
                    $scope.chartData = chartData;
                });
        };

        var loadRelevantDatasets = function() {

            var loadDatasetsForModules = function(orgUnits) {
                return datasetRepository.findAllForOrgUnits(_.pluck(orgUnits, "id")).then(function(datasets) {
                    datasets = _.filter(datasets, {"isOriginDataset":false});
                    $scope.datasets = datasets;
                    if (!_.isEmpty(datasets))
                        $scope.selectedDatasetId = datasets[0].id;
                });
            };

            var getOrigins = function(modules) {
                return orgUnitRepository.getAllOrigins(modules).then(function(origins){
                    return modules.concat(origins);
                });
            };

            return orgUnitRepository.getAllModulesInOrgUnits($scope.orgUnit.id).then(getOrigins)
                .then(loadDatasetsForModules);
        };

        var loadOrgUnit = function() {
            var orgUnitId = $routeParams.orgUnit;

            var isOfType = function(orgUnit, type) {
                return _.any(orgUnit.attributeValues, {
                    attribute: {
                        "code": "Type"
                    },
                    value: type
                });
            };

            return orgUnitRepository.get(orgUnitId).then(function(ou) {
                if (isOfType(ou, 'Module'))
                    ou.displayName = ou.parent.name + ' - ' + ou.name;
                $scope.orgUnit = ou;
            });
        };

        var init = function() {
            $scope.loading = true;
            loadOrgUnit()
                .then(loadRelevantDatasets)
                .then(loadChartData)
                .finally(function() {
                    $scope.loading = false;
                });
        };

        init();
    };
});
