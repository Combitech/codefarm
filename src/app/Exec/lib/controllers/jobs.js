"use strict";

const Job = require("../types/job");
const { Controller } = require("servicecom");

class Jobs extends Controller {
    constructor() {
        super(Job, [ "read", "create", "remove", "tag", "ref", "comment", "rerun", "abort" ]);

        this._addAction("rerun", this._rerun);
        this._addAction("abort", this._abort);
    }

    async _rerun(ctx, id) {
        this._isAllowed(ctx, "rerun");
        const obj = await this._getTypeInstance(id);

        await obj.rerun();

        return obj;
    }

    async _abort(ctx, id) {
        /* TODO: Abort action is not yet fully functional.
         * For example if job hasn't started with the direct backend it is not aborted
         */
        this._isAllowed(ctx, "abort");
        const obj = await this._getTypeInstance(id);

        await obj.abort();

        return obj;
    }
}

module.exports = Jobs;
