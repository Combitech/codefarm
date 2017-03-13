"use strict";

const Slave = require("../types/slave");
const { Controller } = require("servicecom");
const Control = require("../control");

class Slaves extends Controller {
    constructor() {
        super(Slave, Controller.DEFAULT_SUPPORT.concat([ "verify", "setonline" ]));
        this._addAction("verify", this._verify);
        this._addAction("setonline", this._setOnline);
    }

    async _verify(ctx, id) {
        this._isAllowed(ctx, "verify");
        const slave = await this._getTypeInstance(id);

        return await Control.instance.verifySlave(slave);
    }

    async _setOnline(ctx, id, data) {
        this._isAllowed(ctx, "setonline");
        const slave = await this._getTypeInstance(id);

        if (data.offline === true || data.online === false) {
            await slave.setOffline();
        } else {
            await slave.setOnline();
        }

        // Re-read slave to get any updates
        return await this._getTypeInstance(id);
    }
}

module.exports = Slaves;
