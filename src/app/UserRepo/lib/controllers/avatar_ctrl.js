"use strict";

const asyncBusboy = require("async-busboy");

class AvatarCtrl {
    constructor(Controller) {
        this.Controller = Controller;
    }

    async setAvatar(id, data, ctx) {
        if (!ctx) {
            this._throw("SetAvatar can only be called via HTTP", 400);
        }

        const obj = await this.Controller._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.req);

        if (files.length !== 1) {
            throw new Error(`Expected one avatar file, ${files.length} files got`);
        }

        await obj.setAvatar(files[0], fields);

        return obj;
    }

    async getAvatar(id, ctx) {
        if (!ctx) {
            this._throw("GetAvatar can only be called via HTTP", 400);
        }

        const obj = await this.Controller._getTypeInstance(id);
        const stream = await obj.getAvatar();

        ctx.length = obj.getSize();
        ctx.type = obj.getMimeType();
        ctx.body = stream;
    }
}

module.exports = AvatarCtrl;
