"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type, notification } = require("typelib");

class Slave extends Type {
    constructor(data) {
        super();

        this.uri = false;
        this.executors = 1;
        this.privateKeyPath = false;
        this.offline = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "slave";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);

        if (data.executors) {
            data.executors = parseInt(data.executors, 10);
        }

        if (data.offline === "true" || data.offline === "false") {
            data.offline = JSON.parse(data.offline);
        }

        if (event === "create") {
            assertProp(data, "uri", true);
            assertType(data.uri, "data.uri", "string");
            assertProp(data, "executors", true);
            assertType(data.executors, "data.executors", "number");
            if (isNaN(data.executors)) {
                throw new Error("executors must be a number");
            }
            assertProp(data, "privateKeyPath", true);
            assertType(data.privateKeyPath, "data.privateKeyPath", "string");
        }
    }

    async setOnline() {
        if (this.offline) {
            this.offline = false;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.online`, this);
        }
    }

    async setOffline() {
        if (!this.offline) {
            this.offline = true;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.offline`, this);
        }
    }
}

module.exports = Slave;
