"use strict";

const Revision = require("../types/revision");
const { Controller } = require("servicecom");

class Revisions extends Controller {
    constructor() {
        super(Revision, [ "read", "tag", "ref", "comment", "merge" ]);

        this._addAction("merge", this._merge);
        this._addAction("setVerified", this.setVerified);
    }

    async _merge(ctx, id) {
        this._isAllowed(ctx, "merge");
        const revision = await this._getTypeInstance(id);

        // TODO: Asynchronous updates done by backend as part of merge isn't updated in revision
        await revision.merge();

        // Re-read revision until todo above is fixed
        return await this._getTypeInstance(id);
    }

    async setVerified(ctx, id, state, data) {
        console.log("Set verified", id, state, data);

        const revision = await this._getTypeInstance(id);

        await revision.updateVerified(state);

        return await this._getTypeInstance(id);
    }
}

module.exports = Revisions;
