define(["lodash"], function(_) {
    _.unionBy = function(lists, key) {
        return _.uniq(_.flatten(_.without(lists, undefined)), key);
    };

    _.xorBy = function(list1, list2, key) {
        return _.xor(_.pluck(list1, key), _.pluck(list2, key));
    };

    _.groupByArray = function(objects, key) {
        var groupedObject = {};
        _.forEach(objects, function(o) {
            _.forEach(o[key], function(k) {
                if (groupedObject[k]) {
                    groupedObject[k].push(o);
                } else {
                    groupedObject[k] = [o];
                }
            });
        });
        return groupedObject;
    };

    //k1 - https://github.com/lodash/lodash/issues/146
    // Just like _.result, but also works for nested objects
    _.extract = function extract(object, property, defaultValue) {
        var obj = object,
            parts = property.split('.'),
            part = parts.shift();

        while (part && obj) {
            obj = obj[part];
            part = parts.shift();
        }
        return obj || defaultValue;
    };

    return _;
});
