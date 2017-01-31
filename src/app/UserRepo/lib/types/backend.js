"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Backend extends Type {
    constructor(data) {
        super();

        this.backendType = "dummy";

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "backend";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertType(data._id, "data._id", "string");
            // backendType is optional
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backendType", false);
        }
    }
}

module.exports = Backend;
