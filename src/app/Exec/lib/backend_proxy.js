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

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
