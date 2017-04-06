"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Backend extends Type {
    constructor(data) {
        super();

        this.hostPrivateKeys = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "backend";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    serialize() {
        const data = super.serialize();
        data.numHostPrivateKeys = data.hostPrivateKeys.length;
        delete data.hostPrivateKeys;

        return data;
    }

    static async validate(event, data) {
        // Host keys are never allowed to be set
        assertProp(data, "hostPrivateKeys", false);

        if (event === "create") {
            assertType(data._id, "data._id", "string");
            assertType(data.backendType, "data.backendType", "string");

            switch (data.backendType) {
            case "direct":
                assertType(data.privateKeyPath, "data.privateKeyPath", "string");
                break;
            case "jenkins":
                assertType(data.host, "data.host", "string");
                break;
            default:
                throw new Error(`Unknown backend type ${data.backendType}`);
            }
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backendType", false);
        }
    }
}

module.exports = Backend;
