"use strict";

const asyncBusboy = require("async-busboy");
const Artifact = require("../types/artifact");
const { Controller } = require("typelib");

class Artifacts extends Controller {
    constructor() {
        super(Artifact, [ "read", "create", "tag", "ref" ]);

        this._addAction("upload", this._upload);
        this._addGetter("download", this._download);
        this._addGetter("validate", this._validate);
    }

    async _upload(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        const { files, fields } = await asyncBusboy(ctx.req);
        if (files.length !== 1) {
            throw new Error(`Expected one artifact file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "upload", data: obj.serialize() }, null, 2);
    }

    async _download(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        await obj.download(ctx);
    }

    async _validate(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        const validationResult = await obj.validate(ctx);

        ctx.type = "json";
        // TODO: Shall validate report in another format?
        ctx.body = JSON.stringify({
            result: "success",
            action: "validate",
            data: {
                validation: validationResult,
                artifact: obj.serialize()
            }
        }, null, 2);
    }
}

module.exports = Artifacts;
