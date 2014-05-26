require.config({
    paths: {
        "Q": "lib/q/q",
        "lodash": "lib/lodash/dist/lodash",
        "properties": "app/conf/properties",
        "overrides": "app/conf/overrides",
        "indexedDBLogger": "app/utils/indexeddb.logger",
        "app": "app/bg.app",
        "hustle": "lib/hustle/hustle",
        "moment": "lib/moment/moment",
        "hustleModule": "lib/angularjs-hustle/hustle.module",

        "angular": "lib/angular/angular",

        //services
        "dataService": "app/service/data.service",
        "metadataService": "app/service/metadata.service",
        "services": "app/service/bg.services",
        "dataValuesService": "app/service/datavalues.service",

        //Repositories
        "repositories": "app/repository/bg.repositories",
        "dataRepository": "app/repository/data.repository",
        "dataSetRepository": "app/repository/dataset.repository",
        "userPreferenceRepository": "app/repository/userpreference.repository",


        //consumers
        "consumers": "app/consumer/consumers",
        "consumerRegistry": "app/consumer/consumer.registry",
        "dataValuesConsumer": "app/consumer/datavalues.consumer",
        "angular-indexedDB": "lib/angular-indexedDB/src/indexeddb",

        //Interceptors
        "httpInterceptor": "app/interceptors/http.interceptor"
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-indexedDB': {
            deps: ["angular"]
        },
        'hustleModule': {
            deps: ["angular", "hustle"]
        }
    }
});
console.log("Config is complete");