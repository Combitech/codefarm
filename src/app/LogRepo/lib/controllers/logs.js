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

    async _upload(id, data, ctx) {
        if (!ctx) {
            this._throw("Upload can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.req);
        if (files.length !== 1) {
            throw new Error(`Expected one log file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        return obj;
    }

    async _download(id, ctx) {
        if (!ctx) {
            this._throw("Download can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);
        const stream = await obj.download();

        ctx.length = obj.fileMeta.size;
        ctx.type = obj.fileMeta.mimeType;
        ctx.body = stream;
    }
}

module.exports = Logs;
