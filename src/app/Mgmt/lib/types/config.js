"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const { assertType, assertProp } = require("misc");
const Db = require("../db");

let msgBus = false;

class Config extends Type {
    constructor(data) {
        super();

        if (data) {
            this.set(data);
        }
    }

    static setMb(mb) {
        msgBus = mb;
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "config";
    }

    static async _getDb() {
        return Db.instance.db;
    }

    static async _getMb() {
        return msgBus;
    }

    static async validate(event, data) {
        // Required to exist
        assertType(data.name, "data.name", "string");

        // Required not to exist
        assertProp(data, "_id", false);
    }
}

module.exports = Config;
