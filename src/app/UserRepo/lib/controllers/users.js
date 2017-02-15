"use strict";

const asyncBusboy = require("async-busboy");
const User = require("../types/user");
const { Controller } = require("servicecom");

class Users extends Controller {
    constructor() {
        super(User);

        this._addAction("setavatar", this._setAvatar);
        this._addGetter("avatar", this._getAvatar);
        this._addAction("addkey", this._addKey);
        this._addGetter("keys", this._getKeys);
    }

    async _setAvatar(id, data, ctx) {
        if (!ctx) {
            this._throw("SetAvatar can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.req);

        if (files.length !== 1) {
            throw new Error(`Expected one avatar file, ${files.length} files got`);
        }

        await obj.setAvatar(files[0], fields);

        return obj;
    }

    async _getAvatar(id, ctx) {
        if (!ctx) {
            this._throw("GetAvatar can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);
        const stream = await obj.getAvatar();

        ctx.length = obj.avatar.meta.size;
        ctx.type = obj.avatar.meta.mimeType;
        ctx.body = stream;
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
