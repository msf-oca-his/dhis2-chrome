define(["countryController", "angularMocks", "utils", "moment"], function(CountryController, mocks, utils, moment) {

    describe("contry controller", function() {

        var scope, timeout, q, location, anchorScroll, hustle, orgUnitRepo;

        beforeEach(module('hustle'));
        beforeEach(mocks.inject(function($rootScope, $hustle, $q, $timeout, $location) {
            scope = $rootScope.$new();
            q = $q;
            hustle = $hustle;
            timeout = $timeout;
            location = $location;

            orgUnitMapper = {
                getChildOrgUnitNames: function() {}
            };

            orgUnitRepo = utils.getMockRepo(q);

            scope.isEditMode = true;
            scope.orgUnit = {
                id: "blah"
            };

            anchorScroll = jasmine.createSpy();
            countryController = new CountryController(scope, hustle, orgUnitRepo, q, location, timeout, anchorScroll);
        }));

        it("should open the opening date datepicker", function() {

            var event = {
                preventDefault: function() {},
                stopPropagation: function() {}
            };
            spyOn(event, 'preventDefault');
            spyOn(event, 'stopPropagation');

            scope.openOpeningDate(event);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(scope.openingDate).toBe(true);
        });

        it("should save country in dhis", function() {
            var orgUnitId = '131658d54b1';

            var newOrgUnit = {
                'name': 'Org1',
                'openingDate': moment().toDate(),
            };

            var parent = {
                'name': 'Name1',
                'id': 'Id1',
                'level': '2',
            };

            var expectedNewOrgUnit = {
                'id': orgUnitId,
                'name': newOrgUnit.name,
                'level': 3,
                'openingDate': moment(newOrgUnit.openingDate).format("YYYY-MM-DD"),
                'shortName': newOrgUnit.name,
                'parent': {
                    'id': parent.id,
                    'name': parent.name,
                },
                'attributeValues': [{
                    'attribute': {
                        'code': 'Type',
                        'name': 'Type',
                        'id': "a1fa2777924"
                    },
                    'value': "Country"
                }]
            };

            spyOn(hustle, "publish").and.returnValue(utils.getPromise(q, {}));

            scope.save(newOrgUnit, parent);
            scope.$apply();

            expect(orgUnitRepo.upsert).toHaveBeenCalledWith(expectedNewOrgUnit);
            expect(hustle.publish).toHaveBeenCalledWith({
                "data": expectedNewOrgUnit,
                "type": "createOrgUnit"
            }, 'dataValues');
        });

        it("should display error if saving organization unit fails", function() {
            var newOrgUnit = {};


            scope.save(newOrgUnit, parent);
            scope.$apply();

            expect(scope.saveFailure).toEqual(true);
        });

        it("should show project details when in view mode", function() {
            scope.newOrgUnit = {};
            scope.orgUnit = {
                "name": "anyname",
                "openingDate": "YYYY-MM-DD",
            };

            var expectedNewOrgUnit = {
                'name': scope.orgUnit.name,
                'openingDate': scope.orgUnit.openingDate,
            };

            scope.isEditMode = false;
            scope.$apply();

            countryController = new CountryController(scope, hustle, orgUnitRepo, q, location, timeout, anchorScroll);

            expect(scope.newOrgUnit).toEqual(expectedNewOrgUnit);
        });

    });
});