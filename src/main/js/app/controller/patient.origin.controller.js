define(["lodash", "moment", "dhisId"], function(_, moment, dhisId) {
    return function($scope, $hustle, patientOriginRepository) {

        var publishMessage = function(data, action) {
            return $hustle.publish({
                "data": data,
                "type": action
            }, "dataValues");
        };

        $scope.save = function(patientOrigin) {

            var onSuccess = function(data) {
                $scope.saveFailure = false;
                if ($scope.$parent.closeNewForm)
                    $scope.$parent.closeNewForm($scope.orgUnit, "savedOriginDetails");
                return data;
            };

            var onFailure = function(error) {
                $scope.saveSuccess = false;
                $scope.saveFailure = true;
                return error;
            };


            var projectOrigins = _.isEmpty($scope.projectOrigins) ? [] : $scope.projectOrigins;
            patientOrigin.id = dhisId.get(patientOrigin.name);
            patientOrigin.clientLastUpdated = moment().toISOString();
            projectOrigins.push(patientOrigin);

            var payload = {
                orgUnit: $scope.projectId,
                origins: projectOrigins
            };
            return patientOriginRepository.upsert(payload).
            then(_.partial(publishMessage, payload, "uploadPatientOriginDetails")).then(onSuccess, onFailure);
        };

        var getPatientOriginDetails = function() {
            return patientOriginRepository.get($scope.projectId).then(function(patientOriginDetails) {
                if (!_.isEmpty(patientOriginDetails) && !_.isEmpty(patientOriginDetails.origins))
                    $scope.projectOrigins = patientOriginDetails.origins;
            });
        };

        var init = function() {
            $scope.projectId = $scope.orgUnit.id;
            return getPatientOriginDetails($scope.projectId);
        };

        init();

    };
});