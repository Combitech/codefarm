"use strict";

const Repository = require("../types/repository");
const Revision = require("../types/revision");
const { Controller } = require("servicecom");

class Repositories extends Controller {
    constructor() {
        super(Repository, [ "read", "create", "remove", "tag", "ref" ]);

        this._addGetter("uri", this._uri);
        this._addGetter("flows", this._flows);
    }

    async _uri(ctx, id) {
        const obj = await this._getTypeInstance(id);
        const uri = await obj.getUri();

        if (!uri) {
            this._throw("No URI built", 500);
        }

        return `${uri}\n`;
    }

    async _flows(ctx, id) {
        await this._getTypeInstance(id);

        const tags = await Revision.distinct("tags", { repository: id });

        return tags
        .filter((tag) => tag.startsWith("step:flow:"))
        .map((tag) => tag.replace("step:flow:", ""));
    }
}

module.exports = Repositories;
