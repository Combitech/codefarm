"use strict";

const STATE = require("./service_state");

const allowedStateVals = Object.keys(STATE).map((key) => STATE[key]);

const assertStateAllowed = (state) => {
    if (allowedStateVals.indexOf(state) === -1) {
        throw new Error(`StateEvent.state set to ${state}, ` +
            `allowed states ${JSON.stringify(allowedStateVals)}`);
    }
};

class StateEvent {
    constructor(mgmtBusEvent) {
        const stateVal = mgmtBusEvent.newdata.state;
        // Make sure that all service states received are implemented!
        assertStateAllowed(stateVal);
        this.type = "StateEvent";
        this.state = stateVal;
        this.name = mgmtBusEvent.newdata.name;
        this.uses = mgmtBusEvent.newdata.uses;
        this.provides = mgmtBusEvent.newdata.provides;
        this.time = mgmtBusEvent.time;
        this.status = mgmtBusEvent.newdata.status;
    }
}

module.exports = StateEvent;
