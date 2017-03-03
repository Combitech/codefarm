"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");
const Team = require("./team");

const DEFAULT_BACKEND = "Dummy";

class User extends Type {
    constructor(data) {
        super();

        this.backend = DEFAULT_BACKEND;
        this.name = false;
        this.email = [];
        this.telephone = false;
        this.keys = [];
        this.teams = [];

        if (data) {
            this.set(data);
        }
        BackendProxy.instance.constructUser(this);
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

        // We don't want to expose any potential secrets...
        delete data.keys;

        // TODO: Move to backend...
        delete data.passwordHash;

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

    static async factory(data) {
        // User doesn't exist, checked in controller...
        const lookupData = await BackendProxy.instance.lookupUser(data);
        let user;
        if (lookupData) {
            user = this._instantiate(lookupData);
        } else {
            user = this._instantiate(data);
        }

        if (!user) {
            throw new Error("Cannot create user from data", data);
        }

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

        await BackendProxy.instance.validateUser(data.backend || DEFAULT_BACKEND, event, data);
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

    async authenticate(password) {
        return BackendProxy.instance.authenticateUser(this, password);
    }
}

module.exports = User;
