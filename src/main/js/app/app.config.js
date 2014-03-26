require.config({
    paths: {
        "angular": "lib/angular/angular",
        "Q": "lib/q/q",
        "lodash": "lib/lodash/dist/lodash",
        "ng-i18n": "lib/ng-i18n/src/js/ng-i18n",
        "angular-route": "lib/angular-route/angular-route",
        "angular-resource": "lib/angular-resource/angular-resource",
        "angular-indexedDB": "lib/angular-indexedDB/src/indexeddb",
        "angular-ui-tabs": "lib/custom/angular-ui-tabs/tabs",
        "angular-ui-accordion": "lib/custom/angular-ui-accordion/accordion",
        "angular-ui-collapse": "lib/custom/angular-ui-collapse/collapse",
        "angular-ui-transition": "lib/custom/angular-ui-transition/transition",
        "migrations": "../data/migrations",
        "migrator": "app/migrator/migrator",
        "properties": "app/conf/properties",

        //Controllers
        "controllers": "app/controller/controllers",
        "dashboardController": "app/controller/dashboard.controller",
        "dataEntryController": "app/controller/data.entry.controller",
        "mainController": "app/controller/main.controller",

        //Directives
        "directives": "app/directive/directives",

        //Services
        "services": "app/service/services",
        "metadataSyncService": "app/service/metadata.sync.service"
    },
    shim: {
        "ng-i18n": {
            deps: ["angular"],
            exports: "i18n"
        },
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            deps: ["angular"],
            exports: 'angular_route'
        },
        'angular-indexedDB': {
            deps: ["angular"],
            exports: 'angular_indexedDB'
        },
        'angular-resource': {
            deps: ["angular"],
            exports: 'angular_resource'
        },
        'angular-ui-tabs': {
            deps: ["angular"],
            exports: 'angular_ui_tabs'
        },
        'angular-ui-transition': {
            deps: ["angular"],
            exports: 'angular_ui_transition'
        },
        'angular-ui-collapse': {
            deps: ["angular", "angular-ui-transition"],
            exports: 'angular_ui_collapse'
        },
        'angular-ui-accordion': {
            deps: ["angular", "angular-ui-collapse"],
            exports: 'angular_ui_accordion'
        }
    }
});
console.log("Config is complete");