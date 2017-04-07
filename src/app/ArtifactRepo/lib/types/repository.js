"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp, assertAnyOf } = require("misc");
const { Type } = require("typelib");
const { VERSION_SCHEMES } = require("version");
const BackendProxy = require("../backend_proxy");

class Repository extends Type {
    constructor(data) {
        super();

        this.backend = false;
        this.versionScheme = "default";
        this.hashAlgorithms = [ "md5", "sha1" ];
        this.initialArtifactTags = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "repository";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    async _saveHook(olddata) {
        if (!olddata) {
            await BackendProxy.instance.createRepo(this);
        } else {
            await BackendProxy.instance.updateRepo(this);
        }
    }

    async _removeHook() {
        await BackendProxy.instance.removeRepo(this);
    }

    static async validate(event, data) {
        if (event === "create") {
            assertType(data.backend, "data.backend", "string");
            // Check that backend exists
            BackendProxy.instance.getBackend(data.backend);
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backend", false);
        }

        if (data.versionScheme) {
            assertAnyOf(data, "versionScheme", "data.versionScheme", VERSION_SCHEMES);
        }

        if (data.hasOwnProperty("initialRevisionTags")) {
            assertType(data.initialRevisionTags, "data.initialRevisionTags", "array");
        }
    }
}

module.exports = Repository;
