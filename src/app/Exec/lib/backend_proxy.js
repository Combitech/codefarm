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

    createExecutor(backend, data = null) {
        const backendType = this.getBackend(backend).backendType;
        const backendClass = super.getBackendClass(backendType);
        if (!("Executor" in backendClass)) {
            throw Error(`Cannot find executor for backend '${backend}'`);
        }

        const createData = Object.assign({ backend }, data);

        return new backendClass.Executor(createData);
    }

    async startJob(executor, job) {
        return this.getBackend(executor.backend).startJob(executor, job);
    }

    async verifySlaveJob(slave) {
        return this.getBackend(slave.backend).verifySlaveJob(slave);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
