"use strict";

const naturalSort = require("javascript-natural-sort");
const { assertType } = require("misc");
const VersionScheme = require("./version_scheme");

const INITIAL_VERSION = "0.0.1";

class Default extends VersionScheme {
    constructor() {
        super();
    }

    _next(latest) {
        assertType(latest, "latest", "string");
        if (latest === "") {
            return INITIAL_VERSION;
        }

        const parts = latest.split(".");
        parts[parts.length - 1] = (parseInt(parts[parts.length - 1], 10) + 1).toString();

        return parts.join(".");
    }

    _compare(a, b) {
        return naturalSort(a, b);
    }

    _isValid(version) {
        return version.match(/^\d+\.\d+\.\d+$/) !== null;
    }
}

module.exports = Default;
