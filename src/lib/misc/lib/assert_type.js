"use strict";

module.exports = (param, paramName, type) => {
    if (type.toLowerCase() === "array") {
        if (!(param instanceof Array)) {
            throw new TypeError(`${paramName} must be an ${type}`);
        }
    } else if (typeof param !== type) {
        throw new TypeError(`${paramName} must be of type ${type}`);
    }
};
