"use strict";

/**
 * Ensures that returned value is an Array
 * If param is considered as false an empty array is returned,
 * otherwise if param is a single value/object it is returned
 * wrapped in an Array. If param is an Array it is returned as-is.
 * @param {*} param Parameter to use as Array
 * @return {Array} Array
 */
const ensureArray = (param) => {
    let paramAsArray = param || [];
    if (!(paramAsArray instanceof Array)) {
        paramAsArray = [ paramAsArray ];
    }

    return paramAsArray;
};

module.exports = ensureArray;
