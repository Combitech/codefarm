
const ensureNonEmptyArray = (array, dummyItem = "__THIS_IS_AN_EMPTY_ARRAY__") =>
    array.length === 0 ? [ dummyItem ] : array;

/** Build MongoDB query object matching all documents having field equal to
 * any of the values in array.
 * @param {String} field Optional fields to append to path
 * @param {Array} array Array to match field
 * @return {Object} Mongo-DB query
 */
const anyOf = (field, array) => {
    return {
        [ field ]: { $in: ensureNonEmptyArray(array) }
    };
};

/** Build MongoDB query object matching all documents having field equal to
 * specified value
 * @param {String} field Optional fields to append to path
 * @param {Any} value Value to match against field
 * @return {Object} Mongo-DB query
 */
const isValue = (field, value) => {
    return {
        [ field ]: value
    };
};

export {
    anyOf,
    isValue
};
