"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");

class Baseline extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.content = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "baseline";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }
}

module.exports = Baseline;
