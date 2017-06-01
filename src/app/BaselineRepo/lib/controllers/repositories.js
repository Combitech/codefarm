"use strict";

const Repository = require("../types/repository");
const Baseline = require("../types/baseline");
const { Controller } = require("servicecom");

class Repositories extends Controller {
    constructor() {
        super(Repository);

        this._addGetter("flows", this._flows);
    }

    async _flows(ctx, id) {
        await this._getTypeInstance(id);

        const tags = await Baseline.distinct("tags", { repository: id });

        return tags
        .filter((tag) => tag.startsWith("step:flow:"))
        .map((tag) => tag.replace("step:flow:", ""));
    }
}

module.exports = Repositories;
