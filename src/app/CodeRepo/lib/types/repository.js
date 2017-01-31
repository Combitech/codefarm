"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");

class Repository extends Type {
    constructor(data) {
        super();

        this.backend = false;

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

    async _saveHook(olddata) {
        if (!olddata) {
            await BackendProxy.instance.create(this);
        } else {
            await BackendProxy.instance.update(this);
        }
    }

    async _removeHook() {
        await BackendProxy.instance.remove(this);

        // TODO: Remove all Revision objects in this repo
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", true);
            assertType(data._id, "data._id", "string");
            assertProp(data, "backend", true);
            assertType(data.backend, "data.backend", "string");
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backend", false);
        }
        await BackendProxy.instance.validateRepository(data.backend, event, data);
    }

    async getUri() {
        return BackendProxy.instance.getUri(this);
    }
}

module.exports = Repository;
