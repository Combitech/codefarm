"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const Backend = require("./types/backend");

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}, ...args) {
        await super.start(config, ...args);
    }

    async validateRepository(backend, event, data) {
        const instance = this.getBackend(backend);
        await instance.validateRepository(event, data);
    }

    async create(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.create(repository);
    }

    async remove(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.remove(repository);
    }

    async update(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.update(repository);
    }

    async merge(repository, revision) {
        const instance = this.getBackend(repository.backend);

        return await instance.merge(repository, revision);
    }

    async setVerified(repository, revision, state) {
        const instance = this.getBackend(repository.backend);

        return await instance.setVerified(repository, revision, state);
    }

    async getUri(repository) {
        const instance = this.getBackend(repository.backend);
        const backendData = await Backend.findOne({ _id: repository.backend });

        return await instance.getUri(backendData, repository);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
