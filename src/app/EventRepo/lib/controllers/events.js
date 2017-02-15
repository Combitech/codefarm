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

    async _getBefore(id, ctx) {
        const event = await this._getTypeInstance(id);

        ctx.type = "json";
        ctx.body = new PassThrough();

        await chain(ctx.body, event, "getParents");
    }

    async _getAfter(id, ctx) {
        const event = await this._getTypeInstance(id);

        ctx.type = "json";
        ctx.body = new PassThrough();

        await chain(ctx.body, event, "getChildren");
    }
}

module.exports = Events;
