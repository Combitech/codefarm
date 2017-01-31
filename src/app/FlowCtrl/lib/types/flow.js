"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Flow extends Type {
    constructor(data) {
        super();

        this.description = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "flow";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", true);
            assertType(data._id, "data._id", "string");
            assertProp(data, "description", true);
            assertType(data.description, "data.description", "string");
        } else {
            assertProp(data, "_id", false);
        }
    }
}

module.exports = Flow;
