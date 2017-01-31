"use strict";

const Revision = require("../types/revision");
const { Controller } = require("typelib");

class Revisions extends Controller {
    constructor() {
        super(Revision, [ "read", "tag", "ref" ]);

        this._addAction("merge", this._merge);
    }

    async _merge(ctx, id) {
        const parentIds = ctx.query.parentIds || [];

        let revision = await this._getTypeInstance(ctx, id);

        // TODO: Asynchronous updates done by backend as part of merge isn't updated in revision
        await revision.merge(parentIds);

        // Re-read revision until todo above is fixed
        revision = await this._getTypeInstance(ctx, id);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "merge", data: revision.serialize() }, null, 2);
    }
}

module.exports = Revisions;
