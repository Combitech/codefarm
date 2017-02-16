"use strict";

module.exports = (param, paramName, type) => {
    const lcType = type.toLowerCase();
    if (lcType === "ref") {
        if (param === null || typeof param !== "object") {
            throw new TypeError(`${paramName} must be a ${lcType}: Not an object`);
        }
        if (param._ref !== true) {
            throw new TypeError(`${paramName} must be a ${lcType}: Property _ref missing`);
        }
        if (!param.id) {
            throw new TypeError(`${paramName} must be a ${lcType}: Property id missing`);
        }
        if (typeof param.type !== "string") {
            throw new TypeError(`${paramName} must be a ${lcType}: Property type missing`);
        }
        // Do not require ref.name
    } else if (lcType === "array") {
        if (!(param instanceof Array)) {
            throw new TypeError(`${paramName} must be an ${lcType}`);
        }
    } else if (param === null || typeof param !== lcType) {
        throw new TypeError(`${paramName} must be of type ${lcType}`);
    }
};
