define(['dashboardController', 'reportsController', 'dataEntryController', 'mainController', 'orgUnitContoller', 'loginController', 'opUnitController', 'aggregateModuleController',
        'lineListModuleController', 'projectController', 'countryController', 'confirmDialogController', 'projectUserController',
        'aggregateDataEntryController', 'lineListDataEntryController', 'patientOriginController', 'productKeyController',
        'lineListSummaryController', 'dataApprovalController', 'dataEntryApprovalDashboardController', 'lineListOfflineApprovalController', 'appCloneController', 'downloadDataController', 'notificationDialogController', 'selectLanguageController',
        'referralLocationsController', 'notificationsController'
    ],
    function(dashboardController, reportsController, dataEntryController, mainController, orgUnitContoller, loginController, opUnitController, aggregateModuleController,
        lineListModuleController, projectController, countryController, confirmDialogController, projectUserController,
        aggregateDataEntryController, lineListDataEntryController, patientOriginController, productKeyController,
        lineListSummaryController, dataApprovalController, dataEntryApprovalDashboardController, lineListOfflineApprovalController, appCloneController, downloadDataController, notificationDialogController, selectLanguageController,
        referralLocationsController, notificationsController) {

        var init = function(app) {
            app.controller('dashboardController', ['$scope', '$hustle', '$q', '$rootScope', '$timeout', dashboardController]);
            app.controller('reportsController', ['$scope', '$q', '$routeParams', 'datasetRepository', 'orgUnitRepository', 'chartRepository', reportsController]);
            app.controller('dataEntryApprovalDashboardController', ['$scope', '$hustle', '$q', '$rootScope', '$modal', '$timeout', '$location', 'orgUnitRepository', 'approvalDataRepository', 'dataRepository', 'programEventRepository', dataEntryApprovalDashboardController]);
            app.controller('dataEntryController', ['$scope', '$routeParams', '$q', '$location', '$rootScope', 'orgUnitRepository', dataEntryController]);
            app.controller('aggregateDataEntryController', ['$scope', '$routeParams', '$q', '$hustle', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', '$timeout', 'dataRepository', 'systemSettingRepository', 'approvalDataRepository', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'referralLocationsRepository', aggregateDataEntryController]);
            app.controller('dataApprovalController', ['$scope', '$routeParams', '$q', '$hustle', 'dataRepository', 'systemSettingRepository', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', 'approvalDataRepository', '$timeout', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'referralLocationsRepository', dataApprovalController]);
            app.controller('lineListDataEntryController', ['$scope', '$rootScope', '$routeParams', '$location', '$anchorScroll', 'programEventRepository', 'optionSetRepository', 'orgUnitRepository', 'systemSettingRepository', 'programRepository', lineListDataEntryController]);
            app.controller('lineListSummaryController', ['$scope', '$q', '$hustle', '$modal', '$window', '$timeout', '$location', '$anchorScroll', '$routeParams', 'programRepository', 'programEventRepository', 'systemSettingRepository', 'orgUnitRepository', 'approvalDataRepository', 'referralLocationsRepository', lineListSummaryController]);
            app.controller('orgUnitContoller', ['$scope', '$indexedDB', '$q', '$location', '$timeout', '$anchorScroll', 'orgUnitRepository', orgUnitContoller]);
            app.controller('opUnitController', ['$scope', '$q', '$hustle', 'orgUnitRepository', 'orgUnitGroupHelper', '$indexedDB', '$location', '$modal', 'patientOriginRepository', 'orgUnitGroupSetRepository', opUnitController]);
            app.controller('aggregateModuleController', ['$scope', '$hustle', 'orgUnitRepository', 'datasetRepository', 'systemSettingRepository', '$indexedDB', '$location', '$q', '$modal', 'orgUnitGroupHelper', 'originOrgunitCreator', aggregateModuleController]);
            app.controller('lineListModuleController', ['$scope', '$hustle', 'orgUnitRepository', 'systemSettingRepository', '$q', '$modal', 'programRepository', 'orgUnitGroupHelper', 'datasetRepository', 'originOrgunitCreator', lineListModuleController]);
            app.controller('projectController', ['$scope', '$rootScope', '$hustle', 'orgUnitRepository', '$q', 'orgUnitGroupHelper', 'approvalDataRepository', 'orgUnitGroupSetRepository', projectController]);
            app.controller('mainController', ['$q', '$scope', '$location', '$rootScope', '$hustle', 'ngI18nResourceBundle', '$indexedDB', 'metadataImporter', 'sessionHelper', 'orgUnitRepository', mainController]);
            app.controller('loginController', ['$rootScope', '$scope', '$location', '$indexedDB', '$q', '$hustle', 'sessionHelper', loginController]);
            app.controller('countryController', ['$scope', '$hustle', 'orgUnitRepository', '$q', '$location', '$timeout', '$anchorScroll', countryController]);
            app.controller('confirmDialogController', ['$scope', '$modalInstance', confirmDialogController]);
            app.controller('notificationDialogController', ['$scope', '$modalInstance', notificationDialogController]);
            app.controller('projectUserController', ['$scope', '$hustle', '$timeout', '$modal', 'userRepository', projectUserController]);
            app.controller('patientOriginController', ['$scope', '$hustle', '$q', 'patientOriginRepository', 'orgUnitRepository', 'datasetRepository', 'programRepository', 'originOrgunitCreator', 'orgUnitGroupHelper', patientOriginController]);
            app.controller('productKeyController', ['$scope', '$location', '$rootScope', 'metadataImporter', 'sessionHelper', productKeyController]);
            app.controller('lineListOfflineApprovalController', ['$scope', '$q', 'programEventRepository', 'orgUnitRepository', 'programRepository', 'optionSetRepository', 'datasetRepository', 'referralLocationsRepository', lineListOfflineApprovalController]);
            app.controller('appCloneController', ['$scope', '$modal', '$timeout', 'indexeddbUtils', 'filesystemService', 'sessionHelper', '$location', appCloneController]);
            app.controller('downloadDataController', ['$scope', '$hustle', '$q', '$rootScope', '$timeout', downloadDataController]);
            app.controller('selectLanguageController', ['$scope', '$rootScope', '$indexedDB', 'ngI18nResourceBundle', selectLanguageController]);
            app.controller('referralLocationsController', ['$scope', '$hustle', 'referralLocationsRepository', referralLocationsController]);
            app.controller('notificationsController', ['$scope', '$q', 'userPreferenceRepository', 'chartRepository', notificationsController]);
        };
        return {
            init: init
        };
    });
