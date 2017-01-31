"use strict";

const { serviceMgr } = require("service");
const { chainStreams, assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const version = require("version");
const digestStream = require("digest-stream");
const BackendProxy = require("../backend_proxy");
const Repository = require("./repository");

const STATE = {
    /** Artifact not saved, no version yet */
    NO_VERSION: "no_version",
    /** Artifact saved, no data uploaded yet */
    CREATED: "created",
    /** Artifact saved and data uploaded */
    COMMITED: "commited"
};

const DEFAULT_DIGEST_ENCODING = "hex";

class Artifact extends Type {
    constructor(data) {
        super();

        this.repository = false;
        this.state = STATE.NO_VERSION;
        this.fileMeta = {};
        this.parentIds = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "artifact";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    async _saveHook() {
        /** Assign version if state is NO_VERSION (new object, not saved yet).
         * In this case there is two supported cases:
         * A) An explicit version is requested (this.version is set)
         *   => The validity of the version has already been checked in validate()
         *   => Add _id of the preceeding version to parentIds
         * B) No version requested
         *   => Set version to next version related to preceeding version
         *   => Add _id of the preceeding version to parentIds
         */
        if (this.state === STATE.NO_VERSION) {
            const repository = await Repository.findOne({ _id: this.repository });
            const versionGen = version.create(repository.versionScheme);
            const latest = await Artifact._getLastest(
                this.name, this.repository, versionGen
            );
            if (latest) {
                this.parentIds.push(latest._id);
            }
            if (!this.version) {
                const latestVersion = latest ? latest.version : "";
                this.version = versionGen.next(latestVersion);
            }
            this.state = STATE.CREATED;
        }
    }

    async _removeHook() {
        const repository = await Repository.findOne({ _id: this.repository });
        await BackendProxy.instance.removeArtifact(repository, this);
    }

    static async validate(event, data) {
        // Required to exist
        assertType(data.name, "data.name", "string");
        assertType(data.repository, "data.repository", "string");

        // Required to not exist
        assertProp(data, "_id", false);
        assertProp(data, "state", false);
        assertProp(data, "fileMeta", false);
        assertProp(data, "parentIds", false);

        const repository = await Repository.findOne({ _id: data.repository });
        if (!repository) {
            throw new Error("Repository doesn't exist");
        }

        if (data.version) {
            const versionGen = version.create(repository.versionScheme);
            if (typeof data.version !== "string" || !versionGen.isValid(data.version)) {
                throw new Error("Illegal version format");
            }
            const latest = await Artifact._getLastest(
                data.name, data.repository, versionGen
            );
            if (versionGen.compare(latest.version, data.version) !== -1) {
                throw new Error(`Requested version ${data.version} smaller than latest ${latest.version}`);
            }

            // Artifact state and parentIds will be updated in _saveHook
        }
    }

    _getHashStreams(resultDigests, hashAlgorithms) {
        const hashStreams = [];
        for (const alg of hashAlgorithms) {
            const doneFn = (digest /* length */) => {
                resultDigests[alg] = digest;
            };
            hashStreams.push(digestStream(alg, DEFAULT_DIGEST_ENCODING, doneFn));
        }

        return hashStreams;
    }

    async upload(fileStream, fields, parentIds = []) {
        if (this.state === STATE.COMMITED) {
            throw new Error("Artifact already uploaded");
        }

        const repository = await Repository.findOne({ _id: this.repository });

        // Pipe fileStream through hashing algorithms
        const hashDigests = {};
        const hashStreams = this._getHashStreams(hashDigests, repository.hashAlgorithms);
        const hashFileStream = chainStreams(fileStream, ...hashStreams);

        const uploadInfo = await BackendProxy.instance.uploadArtifact(repository, this, hashFileStream);

        this.state = STATE.COMMITED;
        this.fileMeta.size = fileStream.bytesRead;
        this.fileMeta.mimeType = fileStream.mimeType;
        this.fileMeta.path = fileStream.path;
        this.fileMeta.filename = fileStream.filename;
        this.fileMeta.fieldname = fileStream.fieldname;
        this.fileMeta.hashes = hashDigests;
        this.backendFileInfo = uploadInfo;

        await this.save(parentIds);
    }

    async download(ctx) {
        if (this.state !== STATE.COMMITED) {
            ctx.throw("No artifact uploaded", 404);
        }

        ctx.type = this.fileMeta.mimeType;

        const repository = await Repository.findOne({ _id: this.repository });
        await BackendProxy.instance.downloadArtifact(repository, this, ctx);
    }

    async validate(ctx) {
        if (this.state !== STATE.COMMITED) {
            ctx.throw("No artifact uploaded", 404);
        }

        const repository = await Repository.findOne({ _id: this.repository });
        // Hash streams will store their digest in hashDigests
        const hashDigests = {};
        const hashStreams = this._getHashStreams(hashDigests, repository.hashAlgorithms);

        const readStream = await BackendProxy.instance.getArtifactReadStream(repository, this, ctx);
        const hashFileStream = chainStreams(readStream, ...hashStreams);

        await new Promise((resolve, reject) => {
            hashFileStream
                .on("finish", resolve)
                .on("error", reject);
        });

        const res = {};
        for (const hashAlg of Object.keys(this.fileMeta.hashes)) {
            const expectedHash = this.fileMeta.hashes[hashAlg];
            res[hashAlg] = expectedHash === hashDigests[hashAlg];
        }

        return res;
    }

    /**
     * Get all artifacts in repository with specified name
     * @param {string} name Artifact name
     * @param {string} repoId Repository id
     * @return {Array} Artifacts
     */
    static async _getAllWithName(name, repoId) {
        return await Artifact.findMany({
            name: name,
            repository: repoId
        });
    }

    /**
     * Get _id and version for latest versioned artifact
     * @param {string} name Artifact name
     * @param {string} repoId Repository id
     * @param {VersionScheme} versionGen Version scheme
     * @return {Object} _id, version pair
     */
    static async _getLastest(name, repoId, versionGen) {
        let latest = null;
        const artifacts = await Artifact._getAllWithName(name, repoId);
        if (artifacts.length > 0) {
            // Sort by version, latest version is the last one
            artifacts.sort((a, b) => versionGen.compare(a.version, b.version));
            latest = artifacts[artifacts.length - 1];
        }

        return latest;
    }
}

module.exports = Artifact;
