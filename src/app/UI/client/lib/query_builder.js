
const ensureNonEmptyArray = (array, dummyItem = "__THIS_IS_AN_EMPTY_ARRAY__") =>
    array.length === 0 ? [ dummyItem ] : array;

/** Build MongoDB query object matching all documents having field equal to
 * any of the values in array.
 * @param {String} field Optional fields to append to path
 * @param {Array} array Array to match field
 * @return {Object} Mongo-DB query
 */
const anyOf = (field, array) => ({
    [ field ]: { $in: ensureNonEmptyArray(array) }
});

/** Build MongoDB query object matching all documents having field equal to
 * specified value
 * @param {String} field Optional fields to append to path
 * @param {Any} value Value to match against field
 * @return {Object} Mongo-DB query
 */
const isValue = (field, value) => ({
    [ field ]: value
});

/** Build MongoDB query object matching all documents having any (or all)
 * of the fields matching the pattern.
 * @param {Array} fields Fields to match
 * @param {String|regex} pattern Mongodb $regex pattern
 * @param {String} [options] Mongodb $regex $options
 * @param {String} [matchAnyField] If true it's enough that the pattern matches
 *   any of the fields. If false it must match all fields.
 * @return {Object} Mongo-DB query
 */
const filterFields = (fields, pattern, options = "", matchAnyField = true) => ({
    [ matchAnyField ? "$or" : "$and" ]: fields.map((field) => ({
        [ field ]: {
            $regex: pattern,
            $options: options
        }
    }))
});

export {
    anyOf,
    isValue,
    filterFields
};
