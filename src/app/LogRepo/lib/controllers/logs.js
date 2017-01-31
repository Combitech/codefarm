"use strict";

const asyncBusboy = require("async-busboy");
const Log = require("../types/log");
const { Controller } = require("typelib");

class Logs extends Controller {
    constructor() {
        super(Log, [ "read", "create", "remove", "tag", "ref" ]);

        this._addAction("upload", this._upload);
        this._addGetter("download", this._download);
    }

    async _upload(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        const { files, fields } = await asyncBusboy(ctx.req);
        if (files.length !== 1) {
            throw new Error(`Expected one log file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "upload", data: obj.serialize() }, null, 2);
    }

    async _download(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        await obj.download(ctx);
    }
}

module.exports = Logs;
