"use strict";

const { ServiceMgr } = require("service");
const { assertType } = require("misc");
const { Type } = require("typelib");
const { VERSION_SCHEMES } = require("version");
const BackendProxy = require("../backend_proxy");

class Repository extends Type {
    constructor(data) {
        super();

        this.backend = false;
        this.versionScheme = "default";
        this.hashAlgorithms = [ "md5", "sha1" ];

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

            if (data.versionScheme && !VERSION_SCHEMES.includes(data.versionScheme)) {
                throw new Error(`Invalid version scheme ${data.versionScheme}`);
            }
        } else if (event === "update") {
            // TODO: Do some real check here
        }
    }
}

module.exports = Repository;
