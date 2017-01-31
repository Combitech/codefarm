"use strict";

module.exports = (obj, prop, expectExist = true) => {
    const exist = prop in obj;
    if (expectExist && !exist) {
        throw new TypeError(`Property ${prop} doesn't exist`);
    } else if (!expectExist && exist) {
        throw new TypeError(`Property ${prop} exist`);
    }
};
