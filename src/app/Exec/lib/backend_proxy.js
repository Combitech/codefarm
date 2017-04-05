"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const DirectBackend = require("./backends/direct/index");
const JenkinsBackend = require("./backends/jenkins/index");
const Backend = require("./types/backend");

const BackendTypes = {
    direct: DirectBackend,
    jenkins: JenkinsBackend
};

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}, ...args) {
        const backendTypes = Object.assign({}, BackendTypes, config.types);
        await super.start({ types: backendTypes }, ...args);
    }

    async attach(backend, executor) {
        const instance = this.getBackend(backend);
        await instance.attach(executor);
    }

    async startJob(backend, job, executor) {
        const instance = this.getBackend(backend);
        await instance.startJob(job, executor);
    }

    async detach(backend, executor, reason) {
        const instance = this.getBackend(backend);
        await instance.detach(executor, reason);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
