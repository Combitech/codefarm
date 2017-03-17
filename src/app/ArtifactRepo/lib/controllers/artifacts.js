"use strict";

const asyncBusboy = require("async-busboy");
const Artifact = require("../types/artifact");
const { Controller } = require("servicecom");
const { synchronize } = require("misc");

class Artifacts extends Controller {
    constructor() {
        super(Artifact, [ "read", "create", "tag", "ref", "upload", "validate" ]);

        this._addAction("upload", this._uploadArtifact, "Upload artifact");
        this._addAction("validate", this._validateArtifact, "Validate artifact");
        this._addGetter("download", this._downloadArtifact, "Download artifact");
    }

    /* Controller#_create must be synchronized!
     * The following comment explains why...
     * There exists two cases.
     * A) Create of artifact with explicit version requested
     * B) Create of artifact where ArtifactRepo is expected to set the next
     *    available version.
     * In case A, the validity of the requested version is checked in
     * Artifact.validate, and the new artifact is saved before
     * Controller#_create finishes.
     * In case B, Artifact#_saveHook finds the current latest version,
     * of older instances of the requested artifact and calculates the
     * next version from that. The new artifact is saved before
     * Controller#_create finishes.
     * In both case A and B above it is possible that a simultaneous request
     * to create an other version of the same artifact is issued. And since
     * Artifact#save is only synchronized for the same type instance multiple
     * requests are allowed to execute in parallel.
     * In case A, two create requests requesting the same explicit version
     * might both pass validation before the changes are commited
     * (and thus made visible to other callers of Artifact#_getLastest).
     * In case B, two create requests to create new versions of the same
     * artifact might both end up in Artifact#_saveHook simultaneously,
     * both calculating the same next version before their changes are commited.
     */
    _setupDefaultOperations() {
        // Need to synchronize Controller#_create before default operations
        // is setup.
        synchronize(this, "_create");
        super._setupDefaultOperations();
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
        this._isAllowed(ctx, "validate");
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
