 /*global Date:true*/
 define(["projectsController", "angularMocks", "utils", "lodash"], function(ProjectsController, mocks, utils, _) {
     describe("projects controller", function() {
         var q, db, scope, mockOrgStore, mockOrgUnitLevelStore, allOrgUnits, projectsService,
             projectsController, parent, location, today, _Date, todayStr, timeout;
         var getOrgUnit = function(id, name, level, parent) {
             return {
                 'id': id,
                 'name': name,
                 'level': level,
                 'parent': parent
             };
         };

         var orgUnitLevels = [{
             'level': 1,
             'name': 'Company'
         }, {
             'level': 2,
             'name': 'Operational Center'
         }, {
             'level': 3,
             'name': 'Country'
         }, {
             'level': 4,
             'name': 'Project'
         }];

         var child = {
             'id': 2,
             'name': 'ocp',
             'level': 2,
             'parent': {
                 id: 1
             },
             'children': []
         };

         var expectedOrgUnitTree = [{
             'id': 1,
             'name': 'msf',
             'level': 1,
             'parent': null,
             'children': [child]
         }];

         beforeEach(mocks.inject(function($rootScope, $q, $location, $timeout) {
             q = $q;
             allOrgUnits = [getOrgUnit(1, 'msf', 1, null), getOrgUnit(2, 'ocp', 2, {
                 id: 1
             })];
             scope = $rootScope.$new();
             location = $location;
             timeout = $timeout;
             mockOrgStore = {
                 getAll: function() {},
                 upsert: function() {}
             };
             mockOrgUnitLevelStore = {
                 getAll: function() {}
             };
             var stores = {
                 "organisationUnits": mockOrgStore,
                 "organisationUnitLevels": mockOrgUnitLevelStore
             };
             db = {
                 objectStore: function(store) {
                     return stores[store];
                 }
             };
             projectsService = {
                 "create": function() {}
             };
             spyOn(mockOrgStore, 'getAll').and.returnValue(utils.getPromise(q, allOrgUnits));
             spyOn(mockOrgUnitLevelStore, 'getAll').and.returnValue(utils.getPromise(q, orgUnitLevels));
             _Date = Date;
             todayStr = "2014-04-01";
             today = new Date(todayStr);
             Date = function() {
                 return today;
             };

             parent = {
                 'level': 1,
                 'name': 'Name1',
                 'id': 'Id1'
             };

             projectsController = new ProjectsController(scope, db, projectsService, q, location, timeout);
         }));

         afterEach(function() {
             Date = _Date;
         });

         it("should fetch and display all organisation units", function() {
             spyOn(scope, 'onOrgUnitSelect');

             scope.$apply();

             expect(mockOrgStore.getAll).toHaveBeenCalled();
             expect(scope.organisationUnits).toEqual(expectedOrgUnitTree);
             expect(scope.onOrgUnitSelect).not.toHaveBeenCalled();
             expect(scope.openCreateForm).toEqual(false);
             expect(scope.state).toEqual(undefined);
         });

         it("should fetch and select the newly created organization unit", function() {
             spyOn(location, 'hash').and.returnValue(2);
             projectsController = new ProjectsController(scope, db, projectsService, q, location, timeout);
             spyOn(scope, 'onOrgUnitSelect');

             scope.$apply();

             child.selected = true;
             expect(scope.onOrgUnitSelect).toHaveBeenCalledWith(child);
             expect(scope.state).toEqual({
                 currentNode: child
             });
             expect(scope.saveSuccess).toEqual(true);
         });

         it("should display a timed message after creating a organization unit", function() {
             spyOn(location, 'hash').and.returnValue(2);
             projectsController = new ProjectsController(scope, db, projectsService, q, location, timeout);
             spyOn(scope, 'onOrgUnitSelect');

             scope.$apply();

             expect(scope.saveSuccess).toEqual(true);
             timeout.flush();
             expect(scope.saveSuccess).toEqual(false);
         });

         it("should get organization unit level mapping", function() {
             scope.$apply();

             expect(mockOrgUnitLevelStore.getAll).toHaveBeenCalled();
             expect(scope.orgUnitLevelsMap).toEqual({
                 1: 'Company',
                 2: 'Operational Center',
                 3: 'Country',
                 4: 'Project'
             });
         });

         it("should show the selected organisation unit details", function() {
             var orgUnit = {
                 'id': 1
             };
             scope.openCreateForm = true;
             scope.onOrgUnitSelect(orgUnit);

             scope.$apply();

             expect(scope.orgUnit).toEqual(orgUnit);
             expect(scope.openCreateForm).toEqual(false);
         });

         it("should save organization unit in dhis", function() {
             var orgUnit = {
                 'id': 2,
                 'name': 'Org1',
                 'openingDate': today
             };
             var orgUnitId = 'a4acf9115a7';
             spyOn(mockOrgStore, 'upsert').and.returnValue(utils.getPromise(q, orgUnitId));
             spyOn(projectsService, 'create').and.returnValue(utils.getPromise(q, {}));
             spyOn(location, 'hash');

             scope.save(orgUnit, parent);
             scope.$apply();

             expect(orgUnit.level).toEqual(2);
             expect(orgUnit.shortName).toBe('Org1');
             expect(orgUnit.id).toEqual(orgUnitId);
             expect(orgUnit.openingDate).toEqual(todayStr);
             expect(orgUnit.parent).toEqual(_.pick(parent, "name", "id"));

             expect(projectsService.create).toHaveBeenCalledWith(orgUnit);
             expect(mockOrgStore.upsert).toHaveBeenCalledWith(orgUnit);

             expect(location.hash).toHaveBeenCalledWith(orgUnitId);
         });

         it("should display error if saving organization unit fails", function() {
             var orgUnit = {
                 'id': 1
             };
             spyOn(projectsService, 'create').and.returnValue(utils.getRejectedPromise(q, {}));

             scope.save(orgUnit, parent);
             scope.$apply();

             expect(projectsService.create).toHaveBeenCalledWith(orgUnit);
             expect(scope.saveFailure).toEqual(true);
         });

         it("should get child level", function() {
             scope.$apply();

             expect(scope.getLevel({
                 'level': 1
             }, 1)).toEqual("Operational Center");
             expect(scope.getLevel({
                 'level': 0
             }, 1)).toEqual("Company");
             expect(scope.getLevel({
                 'level': 4
             }, 1)).toEqual(undefined);
             expect(scope.getLevel()).toEqual(undefined);
         });

         it("should allow user to only create new country or project", function() {
             scope.$apply();

             expect(scope.canCreateChild({
                 'level': 1
             })).toEqual(false);
             expect(scope.canCreateChild({
                 'level': 2
             })).toEqual(true);
             expect(scope.canCreateChild({
                 'level': 3
             })).toEqual(true);
             expect(scope.canCreateChild({
                 'level': 4
             })).toEqual(false);
         });

         it("should open the datepicker", function() {
             var event = {
                 preventDefault: function() {},
                 stopPropagation: function() {}
             };
             spyOn(event, 'preventDefault');
             spyOn(event, 'stopPropagation');

             scope.open(event);

             expect(event.preventDefault).toHaveBeenCalled();
             expect(event.stopPropagation).toHaveBeenCalled();
             expect(scope.opened).toBe(true);
         });

         it("should give maxDate", function() {
             expect(scope.maxDate).toEqual(today);
         });

         it("should set the organization unit", function() {
             var orgUnit = {
                 'id': 1
             };
             spyOn(scope, 'reset');

             scope.onOrgUnitSelect(orgUnit);

             expect(scope.orgUnit).toEqual(orgUnit);
             expect(scope.reset).toHaveBeenCalled();
         });

         it("should reset form", function() {
             var newOrgUnit = {
                 'openingDate': today
             };

             scope.reset();

             expect(scope.newOrgUnit).toEqual(newOrgUnit);
             expect(scope.saveSuccess).toEqual(false);
             expect(scope.saveFailure).toEqual(false);
         });
     });
 });