define(['dashboardController', 'dataEntryController', 'mainController', 'orgUnitContoller', 'loginController', 'opUnitController', 'moduleController', 'projectController', 'countryController', 'confirmDialogController',
        'projectUserController', 'selectProjectController', 'aggregateDataEntryController', 'lineListDataEntryController', 'programRepository'
    ],
    function(dashboardController, dataEntryController, mainController, orgUnitContoller, loginController, opUnitController, moduleController, projectController, countryController, confirmDialogController,
        projectUserController, selectProjectController, aggregateDataEntryController, lineListDataEntryController, programRepository) {
        var init = function(app) {
            app.controller('dashboardController', ['$scope', '$hustle', '$q', '$rootScope', 'approvalHelper', 'dataSetRepository', '$modal', '$timeout', dashboardController]);
            app.controller('dataEntryController', ['$scope', '$routeParams', '$q', '$location', '$rootScope', 'orgUnitRepository', 'programRepository', dataEntryController]);
            app.controller('aggregateDataEntryController', ['$scope', '$routeParams', '$q', '$hustle', '$indexedDB', 'dataRepository', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', 'approvalDataRepository', '$timeout', 'orgUnitRepository', 'approvalHelper', aggregateDataEntryController]);
            app.controller('lineListDataEntryController', ['$scope', '$routeParams', '$q', '$hustle', '$indexedDB', 'dataRepository', '$anchorScroll', '$location', '$modal', '$rootScope', '$window', 'approvalDataRepository', '$timeout', 'orgUnitRepository', 'approvalHelper', lineListDataEntryController]);
            app.controller('orgUnitContoller', ['$scope', '$indexedDB', '$q', '$location', '$timeout', '$anchorScroll', orgUnitContoller]);
            app.controller('opUnitController', ['$scope', '$q', '$hustle', 'orgUnitRepository', '$indexedDB', '$location', '$modal', opUnitController]);
            app.controller('moduleController', ['$scope', '$hustle', 'orgUnitService', 'orgUnitRepository', 'dataSetRepository', 'systemSettingRepository', '$indexedDB', '$location', '$q', '$modal', moduleController]);
            app.controller('projectController', ['$scope', '$rootScope', '$hustle', 'orgUnitRepository', '$q', '$location', '$timeout', '$anchorScroll', 'userRepository', '$modal', 'approvalHelper', projectController]);
            app.controller('mainController', ['$scope', '$location', '$rootScope', 'ngI18nResourceBundle', '$indexedDB', 'userPreferenceRepository', 'orgUnitRepository', 'userRepository', "metadataService", mainController]);
            app.controller('loginController', ['$scope', '$rootScope', '$location', '$indexedDB', '$q', '$hustle', 'userPreferenceRepository', loginController]);
            app.controller('countryController', ['$scope', '$hustle', 'orgUnitRepository', '$q', '$location', '$timeout', '$anchorScroll', countryController]);
            app.controller('confirmDialogController', ['$scope', '$modalInstance', confirmDialogController]);
            app.controller('projectUserController', ['$scope', '$hustle', 'userRepository', projectUserController]);
            app.controller('selectProjectController', ['$scope', '$location', '$rootScope', 'orgUnitRepository', 'userRepository', 'userPreferenceRepository', selectProjectController]);
        };
        return {
            init: init
        };
    });