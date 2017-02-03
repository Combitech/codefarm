"use strict";

const WeakValueMapLib = require("weak-value-map");

class WeakValueMap {
    constructor(name = "") {
        this._map = new WeakValueMapLib();
        this._name = name;
    }

    remove(key) {
        this._map.delete(key);
    }

    get(key) {
        return this._map.get(key);
    }

    set(key, value) {
        this._map.set(key, value);
    }

    destroy() {
        this._map = null;
    }
}

module.exports = WeakValueMap;
