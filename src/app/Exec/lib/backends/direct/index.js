"use strict";

const { AsyncEventEmitter } = require("emitter");

class DirectBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
    }

    async start() {
    }

    async dispose() {
    }

    getPrivateKeyPath() {
        return this.backend.privateKeyPath;
    }

    getAuthUser() {
        return this.backend.authUser;
    }

    get backendType() {
        return this.backend.backendType;
    }
}

module.exports = DirectBackend;
