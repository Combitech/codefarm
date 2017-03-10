"use strict";

const asyncBusboy = require("async-busboy");
const Artifact = require("../types/artifact");
const { Controller } = require("servicecom");

class Artifacts extends Controller {
    constructor() {
        super(Artifact, [ "read", "create", "tag", "ref" ]);

        this._addAction("upload", this._uploadArtifact, "Upload artifact");
        this._addAction("validate", this._validateArtifact, "Validate artifact");
        this._addGetter("download", this._downloadArtifact, "Download artifact");
    }

    async _uploadArtifact(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("Upload can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.httpCtx.req);

        if (files.length !== 1) {
            throw new Error(`Expected one artifact file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        return obj;
    }

    async _downloadArtifact(ctx, id) {
        if (ctx.reqType !== "http") {
            this._throw("Download can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);
        const stream = await obj.download();

        ctx.httpCtx.length = obj.fileMeta.size;
        ctx.httpCtx.type = obj.fileMeta.mimeType;
        ctx.httpCtx.body = stream;
    }

    async _validateArtifact(ctx, id) {
        console.log("validateArtifact", ctx.tokenData);
        const obj = await this._getTypeInstance(id);
        const validation = await obj.validate();

        // TODO: Shall validate report in another format?
        return {
            validation: validation,
            artifact: obj.serialize()
        };
    }
}

module.exports = Artifacts;
