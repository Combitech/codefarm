"use strict";

const asyncBusboy = require("async-busboy");
const Artifact = require("../types/artifact");
const { Controller } = require("servicecom");

class Artifacts extends Controller {
    constructor() {
        super(Artifact, [ "read", "create", "tag", "ref" ]);

        this._addAction("upload", this._uploadArtifact);
        this._addGetter("download", this._downloadArtifact);
        this._addGetter("validate", this._validateArtifact);
    }

    async _uploadArtifact(id, data, ctx) {
        if (!ctx) {
            this._throw("Upload can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);

        const { files, fields } = await asyncBusboy(ctx.req);

        if (files.length !== 1) {
            throw new Error(`Expected one artifact file, ${files.length} files got`);
        }

        await obj.upload(files[0], fields);

        return obj;
    }

    async _downloadArtifact(id, ctx) {
        if (!ctx) {
            this._throw("Download can only be called via HTTP", 400);
        }

        const obj = await this._getTypeInstance(id);
        const stream = await obj.download();

        ctx.length = obj.fileMeta.size;
        ctx.type = obj.fileMeta.mimeType;
        ctx.body = stream;
    }

    async _validateArtifact(id) {
        const obj = await this._getTypeInstance(id);
        const validation = await obj.validate();

        // TODO: Shall validate report in another format?
        return {
            result: "success",
            action: "validate",
            data: {
                validation: validation,
                artifact: obj.serialize()
            }
        };
    }
}

module.exports = Artifacts;
