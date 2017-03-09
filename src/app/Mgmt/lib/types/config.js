"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const { assertType, assertProp } = require("misc");
const Db = require("../db");

let msgBus = false;
let globalOpts = {};

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

    static setGlobalOpts(opts) {
        globalOpts = Object.assign(globalOpts, opts);
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

    serialize() {
        const data = super.serialize();

        return Object.assign(data, globalOpts);
    }
}

Config.disposeGlobals = () => {
    msgBus = false;
    globalOpts = {};
};

module.exports = Config;
