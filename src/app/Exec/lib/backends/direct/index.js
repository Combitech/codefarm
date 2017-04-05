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
}

module.exports = DirectBackend;
