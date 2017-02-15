"use strict";

const { Type } = require("typelib");
const Database = require("./database");

class Thing extends Type {
    constructor(data) {
        super();

        this.thingy = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return "scom"
    }

    static get typeName() {
        return "thing";
    }

    static async _getDb() {
        return await Database.instance;
    }

    static async _getMb() {
        return false;
    }
}

module.exports = Thing;
