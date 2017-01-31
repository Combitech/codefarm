"use strict";

const State = require("../types/state");
const { Controller } = require("typelib");

class States extends Controller {
    constructor() {
        super(State, [ "read" ]);

        this._addAction("restart", this._restart);
    }

    async _restart(ctx) {
        const obj = State.instance;

        obj.restart("REST restart request");

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "restart", data: obj.serialize() }, null, 2);
    }
}

module.exports = States;
