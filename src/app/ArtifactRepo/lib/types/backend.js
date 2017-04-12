"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const { VERSION_SCHEMES } = require("version");

class Backend extends Type {
    constructor(data) {
        super();

        this.backendType = "fs";
        this.hashAlgorithms = [
            "md5", "sha1", "sha256", "sha512"
        ];
        this.versionSchemes = VERSION_SCHEMES.slice(0);

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

    static async validate(event, data) {
        if (data.hasOwnProperty("pollInterval")) {
            data.pollInterval = parseInt(data.pollInterval, 10);
        }

        if (event === "create") {
            assertType(data._id, "data._id", "string");
            assertType(data.backendType, "data.backendType", "string");
            switch (data.backendType) {
            case "fs":
                assertType(data.path, "data.path", "string");
                break;
            case "artifactory":
                assertType(data.uri, "data.uri", "string");
                assertType(data.pollInterval, "data.pollInterval", "number");
                break;
            default:
                throw new Error(`Unknown backend type ${data.backendType}`);
            }
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backendType", false);
            assertProp(data, "path", false);
        }

        if (data.hashAlgorithms) {
            assertType(data.hashAlgorithms, "data.hashAlgorithms", "array");
        }
        assertProp(data, "versionSchemes", false);
    }
}

module.exports = Backend;
