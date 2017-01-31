"use strict";

const Slave = require("../types/slave");
const { Controller } = require("typelib");
const Control = require("../control");

class Slaves extends Controller {
    constructor() {
        super(Slave);
        this._addAction("verify", this._verify);
        this._addAction("setOnline", this._setOnline);
    }

    async _verify(ctx, id) {
        const slave = await this._getTypeInstance(ctx, id);
        const verifyResult = await Control.instance.verifySlave(slave);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "verify", data: verifyResult }, null, 2);
    }

    async _setOnline(ctx, id) {
        let slave = await this._getTypeInstance(ctx, id);
        if (ctx.request.body.offline === true || ctx.request.body.online === false) {
            await slave.setOffline();
        } else {
            await slave.setOnline();
        }

        // Re-read slave to get any updates
        slave = await this._getTypeInstance(ctx, id);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "setOnline", data: slave }, null, 2);
    }
}

module.exports = Slaves;
