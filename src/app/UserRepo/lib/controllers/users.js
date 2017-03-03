"use strict";

const asyncBusboy = require("async-busboy");
const User = require("../types/user");
const { Controller } = require("servicecom");

class Users extends Controller {
    constructor() {
        super(User);

        this._addAction("auth", this._authenticate);
        this._addAction("addkey", this._addKey);
        this._addGetter("keys", this._getKeys);
    }

    async _authenticate(id, data) {
        if (typeof data !== "object" || data === null) {
            throw new Error("Request body must be an object");
        }

        if (typeof data.password !== "string") {
            throw new Error("password not a string");
        }

        const obj = await this._getTypeInstance(id);

        const authenticated = await obj.authenticate(data.password);

        return {
            authenticated,
            user: obj.serialize()
        };
    }

    async _addKey(id, data) {
        if (typeof data !== "string" || data === "") {
            throw new Error("Request body must be a string");
        }

        const obj = await this._getTypeInstance(id);

        await obj.addKey(data);

        return obj;
    }

    async _getKeys(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        return obj.keys;
    }
}

module.exports = Users;
