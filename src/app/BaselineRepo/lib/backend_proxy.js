"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const DummyBackend = require("./backends/dummy/index");
const Backend = require("./types/backend");

const BackendTypes = {
    dummy: DummyBackend
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

    async createBaseline(repository, baseline) {
        const instance = this.getBackend(repository.backend);

        return instance.createBaseline(repository, baseline);
    }

    async removeBaseline(repository, baseline) {
        const instance = this.getBackend(repository.backend);

        return instance.removeBaseline(repository, baseline);
    }

    async updateBaseline(repository, baseline, olddata) {
        const instance = this.getBackend(repository.backend);

        return instance.updateBaseline(repository, baseline, olddata);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
