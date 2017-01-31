"use strict";

const Job = require("../types/job");
const { Controller } = require("typelib");

class Jobs extends Controller {
    constructor() {
        super(Job, [ "read", "create", "remove", "tag", "ref" ]);

        this._addAction("rerun", this._rerun);
    }

    async _rerun(ctx, id) {
        const obj = await this._getTypeInstance(ctx, id);

        await obj.rerun();

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "rerun", data: obj.serialize() }, null, 2);
    }
}

module.exports = Jobs;
