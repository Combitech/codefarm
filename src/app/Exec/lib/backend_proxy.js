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
        const backendType = this.getBackend(backend).backend.backendType;
        if (Object.keys(this.executorClasses).indexOf(backendType) > -1) {
            return new this.executorClasses[backendType](data);
        }

        throw Error(`Cannot find executor for backend '${backend}'`);
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
