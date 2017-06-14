"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const Backend = require("./types/backend");

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}, executorClasses, ...args) {
        this.executorClasses = executorClasses;
        await super.start(config, ...args);
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

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
