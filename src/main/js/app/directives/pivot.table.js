define(["lodash"], function(_) {
    return function() {
        return {
            scope: {
                data: "=",
                table: "="
            },
            controller: ["$scope",
                function($scope) {}
            ],
            templateUrl: "templates/pivot.table.html"
        };
    };
});
