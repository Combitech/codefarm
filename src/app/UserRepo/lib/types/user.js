"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");
const Team = require("./team");

class User extends Type {
    constructor(data) {
        super();

        this.backend = "Dummy";
        this.name = false;
        this.email = [];
        this.telephone = false;
        this.keys = [];
        this.teams = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "user";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    serialize() {
        const data = super.serialize();
        data.numKeys = data.keys.length;

        // We don't want to expose the keys
        delete data.keys;

        return data;
    }

    async _saveHook(olddata) {
        if (!olddata) {
            await BackendProxy.instance.createUser(this);
        } else {
            await BackendProxy.instance.updateUser(this);
        }
    }

    async _removeHook() {
        await BackendProxy.instance.removeUser(this);
    }

    static async findOne(query, options) {
        const db = await this._getDb();
        const data = await db.findOne(this.typeName, query, options);

        if (data) {
            return this._instantiate(data);
        }

        const lookupData = await BackendProxy.instance.lookupUser(query);

        if (!lookupData) {
            return null;
        }

        const user = new User(lookupData);
        await user.save();

        return user;
    }

    static async validate(event, data) {
        // Keys are never allowed to be set
        assertProp(data, "keys", false);

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
        // Teams is optional
        if (data.teams) {
            assertType(data.teams, "data.teams", "array");
            for (const teamId of data.teams) {
                const exist = await Team.exist(teamId);
                if (!exist) {
                    throw new Error(`Team ${teamId} doesn't exist`);
                }
            }
        }
    }

    async addKey(key) {
        assertType(key, "key", "string");

        if (key === "") {
            throw new Error("Key can not be empty");
        }

        if (this.keys.includes(key)) {
            return;
        }

        this.keys.push(key);

        await this.save();
    }
}

module.exports = User;
