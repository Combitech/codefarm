"use strict";

const asyncBusboy = require("async-busboy");
const User = require("../types/user");
const { Controller } = require("servicecom");

class Users extends Controller {
    constructor() {
        super(User);

        this._addAction("addkey", this._addKey);
        this._addGetter("keys", this._getKeys);
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
