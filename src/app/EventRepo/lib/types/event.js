"use strict";

const { serviceMgr } = require("service");
const { Type } = require("typelib");

class Event extends Type {
    constructor(data) {
        super();

        this.content = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "event";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    async getParents() {
        if (this.content.parentIds.length === 0) {
            return [];
        }

        return await Event.findMany({ _id: { $in: this.content.parentIds } });
    }

    async getChildren() {
        return await Event.findMany({ "content.parentIds": this._id });
    }
}

module.exports = Event;
