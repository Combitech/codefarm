"use strict";

const { serviceMgr, STATE } = require("service");
const moment = require("moment");

const DEFAULT_PRINT_STATE_INTERVAL = 60000;
const DEFAULT_UPDATE_TIMEOUT = 20000;

let instance;

class RemoteService {
    constructor(name) {
        this.name = name;
    }

    update(data) {
        this.state = data.state;
        this.uses = data.uses;
        this.provides = data.provides;
        this.lastUpdateTs = moment().utc().format();

        this._tryStopUpdateTimeout();

        if (this.state !== STATE.OFFLINE) {
            this._startUpdateTimeout();
        }
    }

    _startUpdateTimeout() {
        this.timeoutHandle = setInterval(() => {
            this.state = STATE.OFFLINE;
        }, DEFAULT_UPDATE_TIMEOUT);
    }

    _tryStopUpdateTimeout() {
        if (this.timeoutHandle) {
            clearInterval(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    getJson() {
        return {
            id: this.name,
            name: this.name,
            state: this.state,
            uses: this.uses,
            provides: this.provides,
            lastUpdateTs: this.lastUpdateTs
        };
    }

    async dispose() {
        this._tryStopUpdateTimeout();
    }
}

class Monitor {
    constructor() {
        this.services = {};
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        this.printStateHandle = setInterval(
            this._printState.bind(this),
            DEFAULT_PRINT_STATE_INTERVAL
        );
    }

    async mgmtBusListener(event) {
        if (event.event === "snapshot") {
            const [ providerName, providerType ] = event.type.split(".");
            if (providerType === "state") {
                if (!(providerName in this.services)) {
                    // New service discovered
                    this.services[providerName] = new RemoteService(providerName);
                }
                const service = this.services[providerName];
                service.update(event.newdata);
            }
        }
    }

    getServiceStatus() {
        const status = [];
        for (const id of Object.keys(this.services)) {
            status.push(this.services[id].getJson());
        }

        return status;
    }

    _printState() {
        serviceMgr.log("verbose", "Monitor state:", JSON.stringify(this.getServiceStatus(), null, 2));
    }

    async dispose() {
        for (const id of Object.keys(this.services)) {
            await this.services[id].dispose();
        }
        if (this.printStateHandle) {
            clearInterval(this.printStateHandle);
        }
    }
}

module.exports = Monitor;
