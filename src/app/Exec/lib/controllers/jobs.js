"use strict";

const Job = require("../types/job");
const { Controller } = require("servicecom");

class Jobs extends Controller {
    constructor() {
        super(Job, [ "read", "create", "remove", "tag", "ref" ]);

        this._addAction("rerun", this._rerun);
    }

    async _rerun(id) {
        const obj = await this._getTypeInstance(id);

        await obj.rerun();

        return obj;
    }
}

module.exports = Jobs;
