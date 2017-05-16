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
            case "gerrit":
                assertType(data.uri, "data.uri", "string");
                assertType(data.privateKeyPath, "data.privateKeyPath", "string");
                break;
            case "github":
                if (data.port) {
                    data.port = parseInt(data.port, 10);
                }
                assertType(data.port, "data.port", "number");
                assertType(data.target, "data.target", "string");
                assertType(data.isOrganization, "data.isOrganization", "boolean");
                assertType(data.authUser, "data.authUser", "string");
                assertType(data.authToken, "data.authToken", "string");
                assertType(data.webhookURL, "data.webhookURL", "string");
                assertType(data.webhookSecret, "data.webhookSecret", "string");
                break;
            case "gitlab":
                if (data.port) {
                    data.port = parseInt(data.port, 10);
                }
                assertType(data.port, "data.port", "number");
                assertType(data.serverUrl, "data.serverUrl", "string");
                assertType(data.target, "data.target", "string");
                assertType(data.authToken, "data.authToken", "string");
                assertType(data.webhookURL, "data.webhookURL", "string");
                assertType(data.webhookSecret, "data.webhookSecret", "string");
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
