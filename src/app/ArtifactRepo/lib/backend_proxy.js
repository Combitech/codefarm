"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const FsBackend = require("./backends/fs/index");
const ArtifactoryBackend = require("./backends/artifactory/index");
const Backend = require("./types/backend");

const BackendTypes = {
    fs: FsBackend,
    artifactory: ArtifactoryBackend
};

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}, ...args) {
        const backendTypes = Object.assign({}, BackendTypes, config.types);
        await super.start({ types: backendTypes }, ...args);
    }

    async createRepo(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.createRepo(repository);
    }

    async removeRepo(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.removeRepo(repository);
    }

    async updateRepo(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.updateRepo(repository);
    }

    async uploadArtifact(repository, artifact, fileStream) {
        const instance = this.getBackend(repository.backend);

        return instance.uploadArtifact(repository, artifact, fileStream);
    }

    async getArtifactReadStream(repository, artifact) {
        const instance = this.getBackend(repository.backend);

        return await instance.getArtifactReadStream(repository, artifact);
    }

    async removeArtifact(repository, artifact) {
        const instance = this.getBackend(repository.backend);
        await instance.removeArtifact(repository, artifact);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
