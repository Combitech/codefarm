"use strict";

import moment from "moment";
import api from "api.io/api.io-client";

const DEFAULT_UPDATE_TIMEOUT = 20000;

const STATE = {
    NOT_CREATED: "NOT_CREATED",
    CREATED: "CREATED",
    CONNECTED: "CONNECTED",
    SETUP: "SETUP",
    ONLINE: "ONLINE",
    OFFLINE: "OFFLINE",
    EXIT: "EXIT"
};

class RemoteService {
    constructor(name) {
        this.name = name;
        this.id = name;
    }

    update(data) {
        this.state = data.state;
        this.uses = data.uses;
        this.provides = data.provides;
        this.status = data.status;
        this.lastUpdateTs = moment().utc().format();

        this._tryStopUpdateTimeout();

        if (this.state !== STATE.OFFLINE) {
            this._startUpdateTimeout();
        }
    }

    async restart() {
        // State ID is don't care for state restart action
        const response = await api.rest.action(`${this.name}.state`, 0, "restart");

        return response;
    }

    async getActiveConfig() {
        const activeConfig = await api.rest.list("mgmt.config", {
            name: this.name,
            tags: "active"
        });

        return activeConfig;
    }

    _startUpdateTimeout() {
        this.timeoutHandle = setInterval(() => {
            this.state = STATE.OFFLINE;
            for (const useKey of Object.keys(this.uses)) {
                this.uses[useKey].state = STATE.OFFLINE;
            }
        }, DEFAULT_UPDATE_TIMEOUT);
    }

    _tryStopUpdateTimeout() {
        if (this.timeoutHandle) {
            clearInterval(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    dispose() {
        this._tryStopUpdateTimeout();
    }
}

export default RemoteService;
