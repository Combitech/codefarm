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
        console.log("Yo");
    }
}

module.exports = DirectBackend;
