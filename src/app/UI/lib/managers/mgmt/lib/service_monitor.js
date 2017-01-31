"use strict";

const api = require("api.io");
const StateEvent = require("./types/state_event");

class ServiceMonitor {
    constructor() {
        this.subscriptions = [];
    }

    async start() {
        this.mgmtApi = api.register("mgmtApi", {});
        this.subscriptions.push(api.on("connection", () => {
            this.connected = true;
        }));
        this.subscriptions.push(api.on("disconnection", () => {
            this.connected = false;
        }));
    }

    /**
     * Forward mgmtBus events converted to StateEvent to client
     * @param {Object} event Event received on mgmtBus
     * @return {undefined}
     */
    async mgmtBusListener(event) {
        if (this.connected) {
            if (event.event === "snapshot") {
                const [ , providerType ] = event.type.split(".");
                if (providerType === "state") {
                    const stateEvent = new StateEvent(event);
                    this.mgmtApi.emit("stateEvent", stateEvent);
                }
            }
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

module.exports = ServiceMonitor;
