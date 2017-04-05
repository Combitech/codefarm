"use strict";

module.exports = (obj, param, paramName, allowedValues) => {
    const value = obj[param];
    // eslint-disable-next-line no-undefined
    if (value === undefined || allowedValues.indexOf(value) === -1) {
        throw new TypeError(`${paramName} must be one of ${JSON.stringify(allowedValues)}`);
    }
};
