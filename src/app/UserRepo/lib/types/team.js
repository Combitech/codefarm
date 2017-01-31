"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");

class Team extends Type {
    constructor(data) {
        super();

        this.backend = "Dummy";
        this.name = false;
        this.email = false;
        this.webpage = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "team";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    async _saveHook(olddata) {
        if (!olddata) {
            await BackendProxy.instance.createTeam(this);
        } else {
            await BackendProxy.instance.updateTeam(this);
        }
    }

    async _removeHook() {
        await BackendProxy.instance.removeTeam(this);
    }

    static async exist(teamId) {
        const db = await this._getDb();
        const data = await db.findOne(this.typeName, { _id: teamId });

        return !!data;
    }

    static async findOne(query, options) {
        const db = await this._getDb();
        const data = await db.findOne(this.typeName, query, options);

        if (data) {
            return this._instantiate(data);
        }

        const lookupData = await BackendProxy.instance.lookupTeam(query);

        if (!lookupData) {
            return null;
        }

        const team = new Team(lookupData);
        await team.save();

        return team;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertType(data._id, "data._id", "string");
            assertType(data.name, "data.name", "string");
            // Backend is optional
        } else if (event === "update") {
            assertProp(data, "_id", false);
            assertProp(data, "backend", false);
        }

        // Email is optional
        // Telephone is optional
        // webpage is optional
    }
}

module.exports = Team;
