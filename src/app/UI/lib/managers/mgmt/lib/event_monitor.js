"use strict";

const api = require("api.io");

class EventMonitor {
    constructor() {
        this.subscriptions = [];
    }

    async start() {
        this.busMonitorApi = api.register("busMonitorApi", {});
        this.subscriptions.push(api.on("connection", () => {
            this.connected = true;
        }));
        this.subscriptions.push(api.on("disconnection", () => {
            this.connected = false;
        }));
    }

    /**
     * Forward events to client
     * @param {Object} event Event received on bus
     * @return {undefined}
     */
    async busListener(event) {
        if (this.connected) {
            this.busMonitorApi.emit("busEvent", event);
        }
    }

    async dispose() {
        for (const subscription of this.subscriptions) {
            api.off(subscription);
        }
        this.subscriptions.length = 0;
        this.connected = false;
    }
}

module.exports = EventMonitor;
