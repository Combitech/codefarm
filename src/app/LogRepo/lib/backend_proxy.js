"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const BackendFs = require("./backends/fs/index");
const Backend = require("./types/backend");

const BackendTypes = {
    fs: BackendFs
};

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}) {
        const backendTypes = Object.assign({}, BackendTypes, config.types);
        await super.start({ types: backendTypes });
    }

    async createRepo(repository) {
        const backend = this.getBackend(repository.backend);
        await backend.createRepo(repository);
    }

    async removeRepo(repository) {
        const backend = this.getBackend(repository.backend);
        await backend.removeRepo(repository);
    }

    async updateRepo(repository) {
        const backend = this.getBackend(repository.backend);
        await backend.updateRepo(repository);
    }

    async saveLog(repository, log) {
        const backend = this.getBackend(repository.backend);
        await backend.saveLog(repository, log);
    }

    async uploadLog(repository, log, fileStream) {
        const backend = this.getBackend(repository.backend);

        return backend.uploadLog(repository, log, fileStream);
    }

    async appendLog(repository, id, data) {
        const backend = this.getBackend(repository.backend);

        return backend.appendLog(repository, id, data);
    }

    async getLogReadStream(repository, log) {
        const backend = this.getBackend(repository.backend);

        return await backend.getLogReadStream(repository, log);
    }

    async removeLog(repository, log) {
        const backend = this.getBackend(repository.backend);

        await backend.removeLog(repository, log);
    }

    async getLastLines(repository, log, limit) {
        const backend = this.getBackend(repository.backend);

        return await backend.getLastLines(repository, log, limit);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
