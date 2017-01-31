"use strict";

const asyncBusboy = require("async-busboy");
const User = require("../types/user");
const { Controller } = require("typelib");

class Users extends Controller {
    constructor() {
        super(User);

        this._addAction("setavatar", this._setAvatar);
        this._addGetter("avatar", this._getAvatar);
        this._addAction("addkey", this._addKey);
        this._addGetter("keys", this._getKeys);
    }

    async _setAvatar(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);
        const parentIds = ctx.query.parentIds || [];

        const { files, fields } = await asyncBusboy(ctx.req);
        if (files.length !== 1) {
            throw new Error(`Expected one avatar file, ${files.length} files got`);
        }

        await obj.setAvatar(parentIds, files[0], fields);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "addavatar", data: obj.serialize() }, null, 2);
    }

    async _getAvatar(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);
        const binary = ctx.query.binary;
        await obj.getAvatar(ctx, binary);
    }

    async _addKey(ctx, id) {
        const parentIds = ctx.query.parentIds || [];

        if (typeof ctx.request.body !== "string" || ctx.request.body === "") {
            throw new Error("Request body must be a string");
        }

        const obj = await this._getTypeInstance(ctx, id);

        await obj.addKey(parentIds, ctx.request.body);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "addkey", data: obj.serialize() }, null, 2);
    }

    async _getKeys(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        ctx.type = "json";
        ctx.body = JSON.stringify(obj.keys, null, 2);
    }
}

module.exports = Users;
