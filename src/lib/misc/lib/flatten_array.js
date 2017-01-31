"use strict";

/** Flattens an n-dimensional-array (deep)
 * @param {Array} a Array to flatten
 * @return {Array} Flattened array
 */
const flattenArray = (a) =>
    a.reduce((flat, toFlatten) =>
        flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten)
    , []);

module.exports = flattenArray;
