"use strict";

const ExtendableError = require("es6-error");

class ServiceError extends ExtendableError {
    constructor(msg, restart = false) {
        super(msg);
        this.restart = restart;
    }
}

module.exports = { ServiceError };
