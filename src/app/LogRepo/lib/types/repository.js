"use strict";

const { serviceMgr } = require("service");
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
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "repository";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    async appendLog(id, data) {
        await BackendProxy.instance.appendLog(this, id, data);
    }

    async uploadLog(log, data) {
        return await BackendProxy.instance.uploadLog(this, log, data);
    }

    async saveLog(log) {
        await BackendProxy.instance.saveLog(this, log);
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
            await BackendProxy.instance.getBackend(data.backend);

            if (data.versionScheme &&
                VERSION_SCHEMES.indexOf(data.versionScheme) === -1) {
                throw new Error(`Invalid version scheme ${data.versionScheme}`);
            }
        } else if (event === "update") {
            // TODO: Do some real check here
        }
    }
}

module.exports = Repository;
