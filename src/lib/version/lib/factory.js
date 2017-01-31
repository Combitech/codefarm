"use strict";

const Default = require("./schemes/default");
const RState = require("./schemes/rstate");

const schemes = {
    "default": Default,
    "rstate": RState
};

const VERSION_SCHEMES = Object.keys(schemes);

class VersionSchemeFactory {
    static create(scheme, ...ctorArgs) {
        if (!(scheme in schemes)) {
            throw new Error(`Unknown version scheme ${scheme}`);
        }

        return new schemes[scheme](...ctorArgs);
    }
}

module.exports = { VersionSchemeFactory, VERSION_SCHEMES };
