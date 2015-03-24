define(["moment", "lodash", "dateUtils"], function(moment, _, dateUtils) {
    return function(db, $q) {
        var self = this;

        var modifiedPayload = function(payload) {
            payload = _.isArray(payload) ? payload : [payload];
            return _.map(payload, function(datum) {
                datum.period = moment(datum.period, "GGGG[W]W").format("GGGG[W]WW");
                return datum;
            });
        };

        this.saveLevelOneApproval = function(payload) {
            var store = db.objectStore("completedData");
            return store.upsert(modifiedPayload(payload));
        };

        this.saveLevelTwoApproval = function(payload) {
            var store = db.objectStore("approvedData");
            return store.upsert(modifiedPayload(payload));
        };

        this.deleteLevelOneApproval = function(period, orgUnitId) {
            var store = db.objectStore("completedData");
            return store.delete([dateUtils.getFormattedPeriod(period), orgUnitId]);
        };

        this.deleteLevelTwoApproval = function(period, orgUnitId) {
            var store = db.objectStore("approvedData");
            return store.delete([dateUtils.getFormattedPeriod(period), orgUnitId]);
        };

        this.unapproveLevelOneData = function(period, orgUnit) {
            var unapprove = function(data) {
                if (!data) return;
                data.status = "DELETED";
                var store = db.objectStore('completedData');
                return store.upsert(data).then(function() {
                    return data;
                });
            };

            return this.getLevelOneApprovalData(period, orgUnit, true).then(unapprove);
        };

        this.unapproveLevelTwoData = function(period, orgUnit) {
            var unapprove = function(data) {
                if (!data) return;
                data.isApproved = false;
                data.status = "DELETED";
                var store = db.objectStore('approvedData');
                return store.upsert(data).then(function() {
                    return data;
                });
            };

            return this.getLevelTwoApprovalData(period, orgUnit, true).then(unapprove);
        };

        this.getLevelOneApprovalData = function(period, orgUnitId, shouldFilterSoftDeletes) {
            var filterSoftDeletedApprovals = function(d) {
                return shouldFilterSoftDeletes && d && d.status === "DELETED" ? undefined : d;
            };

            var filterCompleted = function(d) {
                return d && d.isComplete && !d.isApproved ? d : undefined;
            };

            var store = db.objectStore('approvals');
            return store.find([dateUtils.getFormattedPeriod(period), orgUnitId])
                .then(filterSoftDeletedApprovals)
                .then(filterCompleted);
        };

        this.getLevelTwoApprovalData = function(period, orgUnitId, shouldFilterSoftDeletes) {
            var filterSoftDeletedApprovals = function(d) {
                return shouldFilterSoftDeletes && d && d.status === "DELETED" ? undefined : d;
            };

            var filterApprovals = function(d) {
                return d && d.isApproved ? d : undefined;
            };

            var store = db.objectStore('approvals');
            return store.find([dateUtils.getFormattedPeriod(period), orgUnitId])
                .then(filterSoftDeletedApprovals)
                .then(filterApprovals);
        };

        this.getApprovalData = function(period, orgUnitId, shouldFilterSoftDeletes) {
            var filterSoftDeletedApprovals = function(d) {
                return shouldFilterSoftDeletes && d && d.status === "DELETED" ? undefined : d;
            };

            var store = db.objectStore('approvals');
            return store.find([dateUtils.getFormattedPeriod(period), orgUnitId])
                .then(filterSoftDeletedApprovals);
        };

        this.getLevelOneApprovalDataForPeriodsOrgUnits = function(startPeriod, endPeriod, orgUnits) {
            var store = db.objectStore('approvals');
            var query = db.queryBuilder().$between(dateUtils.getFormattedPeriod(startPeriod), dateUtils.getFormattedPeriod(endPeriod)).$index("by_period").compile();
            return store.each(query).then(function(approvalData) {
                return _.filter(approvalData, function(ad) {
                    return ad.isComplete && !ad.isApproved && _.contains(orgUnits, ad.orgUnit);
                });
            });
        };

        this.getLevelTwoApprovalDataForPeriodsOrgUnits = function(startPeriod, endPeriod, orgUnits) {
            var store = db.objectStore('approvals');
            var query = db.queryBuilder().$between(dateUtils.getFormattedPeriod(startPeriod), dateUtils.getFormattedPeriod(endPeriod)).$index("by_period").compile();
            return store.each(query).then(function(approvalData) {
                return _.filter(approvalData, function(ad) {
                    return ad.isApproved && _.contains(orgUnits, ad.orgUnit);
                });
            });
        };

        this.getApprovalDataForPeriodsOrgUnits = function(startPeriod, endPeriod, orgUnits) {
            var store = db.objectStore('approvals');
            var query = db.queryBuilder().$between(dateUtils.getFormattedPeriod(startPeriod), dateUtils.getFormattedPeriod(endPeriod)).$index("by_period").compile();
            return store.each(query).then(function(approvalData) {
                return _.filter(approvalData, function(ad) {
                    return _.contains(orgUnits, ad.orgUnit);
                });
            });
        };

        this.markAsComplete = function(periodsAndOrgUnits, completedBy) {
            periodsAndOrgUnits = _.isArray(periodsAndOrgUnits) ? periodsAndOrgUnits : [periodsAndOrgUnits];
            var payload = _.map(periodsAndOrgUnits, function(periodAndOrgUnit) {
                return {
                    "period": moment(periodAndOrgUnit.period, "GGGG[W]W").format("GGGG[W]WW"),
                    "orgUnit": periodAndOrgUnit.orgUnit,
                    "completedBy": completedBy,
                    "completedOn": moment().toISOString(),
                    "isComplete": true,
                    "isApproved": false,
                    "isAccepted": false,
                    "status": "NEW"
                };
            });

            var store = db.objectStore("approvals");
            return store.upsert(payload);
        };

        this.markAsApproved = function(periodsAndOrgUnits, approvedBy) {
            periodsAndOrgUnits = _.isArray(periodsAndOrgUnits) ? periodsAndOrgUnits : [periodsAndOrgUnits];

            var getExistingApprovals = function() {
                var periods = _.uniq(_.pluck(periodsAndOrgUnits, "period"));
                var query = db.queryBuilder().$index("by_period").$in(periods).compile();
                var store = db.objectStore("approvals");
                return store.each(query).then(function(allApprovalsForPeriods) {
                    return _.transform(periodsAndOrgUnits, function(acc, periodAndOrgUnit) {
                        var matchingApprovals = _.filter(allApprovalsForPeriods, {
                            "period": periodAndOrgUnit.period,
                            "orgUnit": periodAndOrgUnit.orgUnit
                        });
                        _.each(matchingApprovals, function(approval) {
                            acc.push(approval);
                        });
                    }, []);
                });
            };

            var updateThemAsApproved = function(approvalsInDb) {

                return _.map(approvalsInDb, function(approval) {
                    approval.isApproved = true;
                    approval.approvedBy = approvedBy;
                    approval.approvedOn = moment().toISOString();
                    approval.status = "NEW";
                    return approval;
                });
            };

            var saveToIdb = function(approvals) {
                var store = db.objectStore("approvals");
                store.upsert(approvals);
            };

            return getExistingApprovals()
                .then(updateThemAsApproved)
                .then(saveToIdb);
        };

        this.markAsAccepted = function(periodsAndOrgUnits, acceptedBy) {
            periodsAndOrgUnits = _.isArray(periodsAndOrgUnits) ? periodsAndOrgUnits : [periodsAndOrgUnits];

            var store = db.objectStore("approvals");

            var getExistingApprovals = function() {
                var periods = _.uniq(_.pluck(periodsAndOrgUnits, "period"));
                var query = db.queryBuilder().$index("by_period").$in(periods).compile();
                return store.each(query).then(function(allApprovalsForPeriods) {
                    return _.transform(periodsAndOrgUnits, function(acc, periodAndOrgUnit) {
                        var matchingApprovals = _.filter(allApprovalsForPeriods, {
                            "period": periodAndOrgUnit.period,
                            "orgUnit": periodAndOrgUnit.orgUnit
                        });
                        _.each(matchingApprovals, function(approval) {
                            acc.push(approval);
                        });
                    }, []);
                });
            };

            var updateThemAsAccepted = function(approvalsInDb) {
                var approvalsGroupedByPeriodOrgUnit = _.groupBy(approvalsInDb, function(approval) {
                    return approval.period + approval.orgUnit;
                });

                return _.map(periodsAndOrgUnits, function(periodAndOrgUnit) {
                    var period = moment(periodAndOrgUnit.period, "GGGG[W]W").format("GGGG[W]WW");
                    var orgUnit = periodAndOrgUnit.orgUnit;
                    var completedBy = _.isUndefined(approvalsGroupedByPeriodOrgUnit[period + orgUnit]) ? acceptedBy : approvalsGroupedByPeriodOrgUnit[period + orgUnit][0].completedBy;
                    var completedOn = _.isUndefined(approvalsGroupedByPeriodOrgUnit[period + orgUnit]) ? moment().toISOString() : approvalsGroupedByPeriodOrgUnit[period + orgUnit][0].completedOn;
                    return {
                        "period": period,
                        "orgUnit": orgUnit,
                        "completedBy": completedBy,
                        "completedOn": completedOn,
                        "approvedBy": acceptedBy,
                        "approvedOn": moment().toISOString(),
                        "isComplete": true,
                        "isApproved": true,
                        "isAccepted": true,
                        "status": "NEW"
                    };
                });
            };

            return getExistingApprovals()
                .then(updateThemAsAccepted)
                .then(store.upsert);
        };

        this.clearApprovals = function(periodsAndOrgUnits) {
            periodsAndOrgUnits = _.isArray(periodsAndOrgUnits) ? periodsAndOrgUnits : [periodsAndOrgUnits];
            var payload = _.map(periodsAndOrgUnits, function(periodAndOrgUnit) {
                return {
                    "period": moment(periodAndOrgUnit.period, "GGGG[W]W").format("GGGG[W]WW"),
                    "orgUnit": periodAndOrgUnit.orgUnit,
                    "isComplete": false,
                    "isApproved": false,
                    "isAccepted": false,
                    "status": "DELETED"
                };
            });

            var store = db.objectStore("approvals");
            return store.upsert(payload);
        };

        this.invalidateApproval = function(period, orgUnit) {
            var store = db.objectStore("approvals");
            return store.delete([dateUtils.getFormattedPeriod(period), orgUnit]);
        };

        this.saveApprovalsFromDhis = function(approvalsFromDhis) {
            approvalsFromDhis = _.isArray(approvalsFromDhis) ? approvalsFromDhis : [approvalsFromDhis];
            var store = db.objectStore("approvals");
            _.each(approvalsFromDhis, function(approvalFromDhis) {
                return self.getApprovalData(approvalFromDhis.period, approvalFromDhis.orgUnit).then(function(approvalFromDb) {
                    return store.upsert(_.merge(approvalFromDb, approvalFromDhis));
                });
            });
        };
    };
});
