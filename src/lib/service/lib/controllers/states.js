"use strict";

const State = require("../types/state");
const { Controller } = require("servicecom");

class States extends Controller {
    constructor() {
        super(State, [ "read" ]);

        this._addAction("restart", this._restart);
    }

    async _restart() {
        const obj = State.instance;

        obj.restart("REST restart request");

        return obj;
    }
}

module.exports = States;
