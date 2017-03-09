"use strict";

const asyncBusboy = require("async-busboy");

class AvatarCtrl {
    constructor(Controller) {
        this.Controller = Controller;
    }

    async setAvatar(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("SetAvatar can only be called via HTTP", 400);
        }

        const obj = await this.Controller._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.httpCtx.req);

        if (files.length !== 1) {
            throw new Error(`Expected one avatar file, ${files.length} files got`);
        }

        await obj.setAvatar(files[0], fields);

        return obj;
    }

    async getAvatar(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("GetAvatar can only be called via HTTP", 400);
        }

        const obj = await this.Controller._getTypeInstance(id);
        const stream = await obj.getAvatar();

        ctx.httpCtx.length = obj.getSize();
        ctx.httpCtx.type = obj.getMimeType();
        ctx.httpCtx.body = stream;
    }
}

module.exports = AvatarCtrl;
