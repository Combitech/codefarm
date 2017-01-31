"use strict";

const { serviceMgr } = require("service");
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
            assertType(data.path, "data.path", "string");
            // backendType is optional
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
