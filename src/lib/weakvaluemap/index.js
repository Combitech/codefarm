"use strict";

const weak = require("weak");
const log = require("log");

class WeakValueMap {
    constructor(name = "") {
        this._map = {};
        this._name = name;
    }

    remove(key, isDead = false) {
        if (key in this._map) {
            delete this._map[key];
            if (isDead) {
                log.verbose(`WeakValueMap[${this._name}][${key}] garbage collected`);
            }
        }
    }

    get(key) {
        return this._map[key] && weak.get(this._map[key]);
    }

    set(key, value) {
        this._map[key] = weak(value, this.remove.bind(this, key, true));
    }

    destroy() {
        for (const key of Object.keys(this._map)) {
            this.remove(key);
        }
    }
}

module.exports = WeakValueMap;
