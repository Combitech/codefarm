"use strict";

const EventEmitter = require("events");

class AsyncEventEmitter extends EventEmitter {
    constructor() {
        super();
    }

    async emit(eventName, ...args) {
        const listeners = this.listeners(eventName);

        if (listeners.length === 0) {
            return;
        }

        for (const listener of listeners) {
            await listener(...args);
        }

        return this;
    }
}

module.exports = { AsyncEventEmitter };
