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
            assertProp(data, "_id", true);
            assertProp(data, "backendType", true);

            assertType(data._id, "data._id", "string");
            assertType(data.backendType, "data.backendType", "string");

            switch (data.backendType) {
            case "direct":
                assertProp(data, "authUser", true);
                assertType(data.authUser, "data.authUser", "string");
                assertType(data.privateKeyPath, "data.privateKeyPath", "string");
                break;
            case "jenkins":
                assertProp(data, "authUser", true);
                assertType(data.authUser, "data.authUser", "string");
                if (data.port) {
                    data.port = parseInt(data.port, 10);
                }
                assertType(data.port, "data.port", "number");
                assertType(data.hostUrl, "data.hostUrl", "string");
                assertType(data.authToken, "data.authToken", "string");
                assertType(data.pollDelay, "data.pollDelay", "number");
                break;
            }
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backendType", false);
        }
    }
}

module.exports = Backend;
