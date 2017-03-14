"use strict";

const User = require("../types/user");
const { Controller } = require("servicecom");
const { assertType } = require("misc");

class Users extends Controller {
    constructor() {
        super(User, Controller.DEFAULT_SUPPORT.concat([ "auth", "setpassword", "setpolicies", "addkey", "keys" ]));

        this._addAction("auth", this._authenticate);
        this._addAction("setpassword", this._setPassword);
        this._addAction("setpolicies", this._setPolicies);
        this._addAction("addkey", this._addKey);
        this._addGetter("keys", this._getKeys);
    }

    async _authenticate(ctx, id, data) {
        this._isAllowed(ctx, "auth");
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

    async _setPassword(ctx, id, data) {
        this._isAllowed(ctx, "setpassword");
        assertType(data, "request body", "object");
        assertType(data.password, "password", "string");
        assertType(data.oldPassword, "oldPassword", "string");

        const obj = await this._getTypeInstance(id);

        await obj.setPassword(data.password, data.oldPassword);

        return obj.serialize();
    }

    async _setPolicies(ctx, id, data) {
        this._isAllowed(ctx, "setpolicies");
        assertType(data, "request body", "object");
        assertType(data.policies, "policies", "array");

        const obj = await this._getTypeInstance(id);

        await obj.setPolicies(data.policies);

        return obj.serialize();
    }

    async _addKey(ctx, id, data) {
        this._isAllowed(ctx, "addkey");
        if (typeof data !== "string" || data === "") {
            throw new Error("Request body must be a string");
        }

        const obj = await this._getTypeInstance(id);

        await obj.addKey(data);

        return obj;
    }

    async _getKeys(ctx, id) {
        const obj = await this._getTypeInstance(id);

        return obj.keys;
    }
}

module.exports = Users;
