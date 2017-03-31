"use strict";

const qs = require("qs");
const { ensureArray } = require("misc");
const Stat = require("../types/stat");
const { Controller } = require("servicecom");

class Stats extends Controller {
    constructor() {
        super(Stat);

        this._addGetter("info", this._info, "Get info");
        this._addGetter("samples", this._samples, "Get samples");
    }

    async _info(ctx, id, data = {}) {
        this._isAllowed(ctx, "read");
        let fields = data.fields || false;
        const opts = data.opts || {};
        if (ctx.reqType === "http") {
            const queryPar = qs.parse(ctx.httpCtx.query);
            if (queryPar.hasOwnProperty("field")) {
                if (queryPar.field !== "false") {
                    fields = ensureArray(queryPar.field);
                }
            }
            if (queryPar.hasOwnProperty("match")) {
                opts.match = JSON.parse(queryPar.match);
            }
            if (queryPar.hasOwnProperty("sort")) {
                opts.sort = JSON.parse(queryPar.sort);
            }
            if (queryPar.hasOwnProperty("limit")) {
                opts.limit = JSON.parse(queryPar.limit);
            }
            // last=N calculates info for the latest N samples
            if (queryPar.hasOwnProperty("last")) {
                opts.sort = { _collected: -1 };
                opts.limit = JSON.parse(queryPar.last);
            }
            // first=N calculates info for the oldest N samples
            if (queryPar.hasOwnProperty("first")) {
                opts.sort = { _collected: 1 };
                opts.limit = JSON.parse(queryPar.first);
            }
        }

        const obj = await this._getTypeInstance(id);

        return await obj.getInfo(fields, opts);
    }

    async _samples(ctx, id, data = {}) {
        this._isAllowed(ctx, "read");
        let fields = data.fields || false;
        const opts = data.opts || {};
        if (ctx.reqType === "http") {
            const queryPar = qs.parse(ctx.httpCtx.query);
            if (queryPar.hasOwnProperty("field")) {
                if (queryPar.field !== "false") {
                    fields = ensureArray(queryPar.field);
                }
            }
            if (queryPar.hasOwnProperty("sort")) {
                opts.sort = JSON.parse(queryPar.sort);
            }
            if (queryPar.hasOwnProperty("limit")) {
                opts.limit = JSON.parse(queryPar.limit);
            }
            // last=N calculates info for the latest N samples
            if (queryPar.hasOwnProperty("last")) {
                opts.sort = { _collected: -1 };
                opts.limit = JSON.parse(queryPar.last);
            }
            // first=N calculates info for the oldest N samples
            if (queryPar.hasOwnProperty("first")) {
                opts.sort = { _collected: 1 };
                opts.limit = JSON.parse(queryPar.first);
            }
        } else {
            if (typeof opts.last === "number") { // eslint-disable-line no-lonely-if
                opts.sort = { _collected: -1 };
                opts.limit = opts.last;
            } else if (typeof opts.first === "number") {
                opts.sort = { _collected: 1 };
                opts.limit = opts.first;
            }
        }

        const obj = await this._getTypeInstance(id);

        return await obj.getSamples(fields, opts);
    }
}

module.exports = Stats;
