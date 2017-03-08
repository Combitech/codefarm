"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Policy extends Type {
    constructor(data) {
        super();

        this.description = "";
        this.name = false;
        this.privileges = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "policy";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertType(data._id, "data._id", "string");
            assertType(data.name, "data.name", "string");
            // Description is optional
        } else if (event === "update") {
            assertProp(data, "_id", false);
        }

        if (data.privileges) {
            assertType(data.privileges, "data.privileges", "array");
        }
    }
}

module.exports = Policy;
