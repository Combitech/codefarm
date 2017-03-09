"use strict";

const Repository = require("../types/repository");
const { Controller } = require("servicecom");

class Repositories extends Controller {
    constructor() {
        super(Repository, [ "read", "create", "remove", "tag", "ref" ]);
        this._addGetter("uri", this._uri);
    }

    async _uri(ctx, id) {
        const obj = await this._getTypeInstance(id);
        const uri = await obj.getUri();

        if (!uri) {
            this._throw("No URI built", 500);
        }

        return `${uri}\n`;
    }
}

module.exports = Repositories;
