"use strict";

const asyncBusboy = require("async-busboy");
const Log = require("../types/log");
const { Controller } = require("servicecom");

class Logs extends Controller {
    constructor() {
        super(Log, [ "read", "create", "remove", "tag", "ref" ]);

        this._addAction("upload", this._upload, "Upload log");
        this._addGetter("download", this._download, "Download log");
    }

    async _upload(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("Upload can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.httpCtx.req);
        if (files.length !== 1) {
            throw new Error(`Expected one log file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        return obj;
    }

    async _download(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("Download can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);
        const stream = await obj.download();

        ctx.httpCtx.length = obj.fileMeta.size;
        ctx.httpCtx.type = obj.fileMeta.mimeType;
        ctx.httpCtx.body = stream;
    }
}

module.exports = Logs;
