"use strict";

const { serviceMgr } = require("service");
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
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "baseline";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }
}

module.exports = Baseline;
