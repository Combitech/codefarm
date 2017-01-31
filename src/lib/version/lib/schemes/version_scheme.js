"use strict";

class VersionScheme {
    constructor() {
    }

    next(latest) {
        return this._next(latest);
    }

    sort(list) {
        return list.sort(this.compare.bind(this));
    }

    compare(a, b) {
        return this._compare(a, b);
    }

    isValid(version) {
        return this._isValid(version);
    }
}

module.exports = VersionScheme;
