"use strict";

const { PassThrough } = require("stream");
const { Controller } = require("servicecom");
const chain = require("../chain");
const Event = require("../types/event");

class Events extends Controller {
    constructor() {
        super(Event, [ "read", "tag" ]);

        this._addGetter("before", this._getBefore);
        this._addGetter("after", this._getAfter);
    }

    async _getBefore(ctx, id) {
        const event = await this._getTypeInstance(id);

        ctx.httpCtx.type = "json";
        ctx.httpCtx.body = new PassThrough();

        await chain(ctx.httpCtx.body, event, "getParents");
    }

    async _getAfter(ctx, id) {
        const event = await this._getTypeInstance(id);

        ctx.httpCtx.type = "json";
        ctx.httpCtx.body = new PassThrough();

        await chain(ctx.httpCtx.body, event, "getChildren");
    }
}

module.exports = Events;
