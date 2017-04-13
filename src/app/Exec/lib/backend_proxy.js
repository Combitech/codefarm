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

    createExecutor(backend, data = null) {
        const backendType = this.getBackend(backend).backendType;
        if (backendType in this.executorClasses) {
            const createData = Object.assign({ backend }, data);

            return new this.executorClasses[backendType](createData);
        }

        throw Error(`Cannot find executor for backend '${backend}'`);
    }

    async startJob(executor, job) {
        return this.getBackend(executor.backend).startJob(executor, job);
    }

    async verifySlaveJob(slave) {
        return this.getBackend(slave.backend).verifySlaveJob(slave);
    }

    async start(config = {}, executorClasses, ...args) {
        const backendTypes = Object.assign({}, BackendTypes, config.types);
        this.executorClasses = executorClasses;
        await super.start({ types: backendTypes }, ...args);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
