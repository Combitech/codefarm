"use strict";

const naturalSort = require("javascript-natural-sort");
const { assertType } = require("misc");
const VersionScheme = require("./version_scheme");

const VALID_CHARS = "ABCDEFGHJKLMNSTUVXYZ";
const PREFIX = "R";
const INTIAL_VERSION = `${PREFIX}1A`;

const splitVersion = (version) => {
    let slash = false;
    // eslint-disable-next-line prefer-template
    const re = new RegExp("^" + PREFIX + "|[0-9]{1,2}|[A-Z]{1,2}|[0-9]{1,2}$", "g");
    const slashPosition = version.indexOf("_");

    if (slashPosition !== -1) {
        slash = version.substr(slashPosition + 1);
        version = version.substr(0, slashPosition);
    }

    const matches = version.match(re);

    if (!matches) {
        return false;
    }

    // Check that we have at least R1A length
    if (matches.length < 3) {
        // console.error("To short.", matches.length);
        return false;
    }

    // Parse variables
    const release = matches[0];
    const major = parseInt(matches[1], 10);
    const minor = matches[2];
    const optional = matches.length >= 4 ? parseInt(matches[3], 10) : false;

    // console.log(release, major, minor, optional);

    // Ok R1 but not RA
    if (isNaN(major)) {
        // console.error("Major is not a number.", major, matches[1]);
        return false;
    }

    // Ok R1 but not R0
    if (major === 0) {
        // console.error("Major is zero.", major, matches[1]);
        return false;
    }

    // Check that we start with prefix
    if (release !== PREFIX) {
        // console.error("Release is not R.", release);
        return false;
    }

    // Ok R1A but not R1R
    for (let n = 0; n < minor.length; n++) {
        if (VALID_CHARS.indexOf(minor.charAt(n)) === -1) {
            // console.error("Minor has invalid char.", minor, minor[n].charAt(n));
            return false;
        }
    }

    // If optional supplied
    if (optional !== false) {
        // Ok R1A01 but not R1A1
        if (matches[3].length <= 1) {
            // console.error("Optional is not two letters.", matches[3]);
            return false;
        }

        // Ok R1A01 but not R1AAA
        if (isNaN(optional)) {
            // console.error("Optional is not a number.", optional, matches[3]);
            return false;
        }

        // Ok R1A01 but not R1A00
        if (optional === 0) {
            // console.error("Optional is zero", optional, matches[3]);
            return false;
        }
    }

    return { release: release, major: major, minor: minor, optional: optional, slash: slash };
};

const joinVersion = (parts) => {
    let version = parts.release.substr(0, 1);
    version += parts.major;
    version += parts.minor;

    if (parts.optional !== false) {
        version += parts.optional < 10 ? `0${parts.optional}` : parts.optional;
    }

    if (parts.slash !== false) {
        version += `_${parts.slash}`;
    }

    return version;
};

const stepChar = (char) => {
    if (char === VALID_CHARS[VALID_CHARS.length - 1]) {
        return VALID_CHARS.charAt(0);
    }

    return VALID_CHARS.charAt(VALID_CHARS.indexOf(char) + 1);
};

const stepMinor = (latest) => {
    const parts = latest.split("");
    let idx = parts.length - 1;

    while (idx >= 0) {
        parts[idx] = stepChar(parts[idx]);

        if (parts[idx] === VALID_CHARS.charAt(0)) {
            idx--;
        } else {
            return parts.join("");
        }
    }

    if (parts.length === 1) {
        return "AA";
    }

    return false;
};

class RState extends VersionScheme {
    constructor() {
        super();
    }

    _next(latest) {
        assertType(latest, "latest", "string");
        if (latest === "") {
            return INTIAL_VERSION;
        }

        const parts = splitVersion(latest);

        if (parts === false) {
            return false;
        }

        let newVersion = false;

        do {
            let carry = true;

            if (parts.optional !== false) {
                carry = false;
                parts.optional++;

                if (parts.optional > 99) {
                    parts.optional = 1;
                    carry = true;
                }
            }

            if (carry) {
                carry = false;

                parts.minor = stepMinor(parts.minor);

                if (parts.minor === false) {
                    parts.minor = "A";
                    carry = true;
                }
            }

            if (carry) {
                parts.major++;

                if (parts.major > 99) {
                    return false;
                }
            }

            newVersion = joinVersion(parts);
        } while (!this._isValid(newVersion));

        return newVersion;
    }

    _compare(a, b) {
        const aPart = splitVersion(a);
        const bPart = splitVersion(b);

        if (aPart.major.length !== bPart.major.length) {
            return aPart.major.length - bPart.major.length;
        } else if (aPart.major !== bPart.major) {
            return naturalSort(aPart.major, bPart.major);
        }

        if (aPart.minor.length !== bPart.minor.length) {
            return aPart.minor.length - bPart.minor.length;
        } else if (aPart.minor !== bPart.minor) {
            return naturalSort(aPart.minor, bPart.minor);
        }

        if (aPart.optional && bPart.optional) {
            return aPart.optional - bPart.optional;
        }

        return 0;
    }

    _isValid(version) {
        return splitVersion(version);
    }
}

module.exports = RState;
