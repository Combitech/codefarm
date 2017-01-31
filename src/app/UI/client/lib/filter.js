/** Checks if object matches filter considering a set of object keys
 * Match is performed on the values dereferenced from the object using keys.
 * The object matches if filter is a substring of any of the values.
 * note1: If no filter is given all objects matches.
 * note2: filter and values are matched after converted to lower-case.
 * @param {String} filter Filter string
 * @param {Object} obj Object
 * @param {Array} keys Keys to consider in object
 * @return {Bool} True if object matches filter
 */
const objectFilter = (filter, obj, keys) => {
    // Show all if no filter
    if (!filter || filter.length === 0) {
        return true;
    }

    filter = filter.toLowerCase();

    const values = keys.map((key) => obj[key]);

    return values.reduce(
        (acc, val) =>
            acc || (
                (typeof val === "string") && // Filter strings
                (val.length > 0) &&
                (val.toLowerCase().indexOf(filter) !== -1)
            ),
        false
    );
};

export {
    objectFilter
};
