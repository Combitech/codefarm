"use strict";

const JobSpec = require("../types/jobspec");
const { Controller } = require("servicecom");
const { assertType } = require("misc");

class JobSpecs extends Controller {
    constructor() {
        super(JobSpec, [ "read", "update", "create", "remove", "tag", "comment", "run" ]);

        this._addAction("run", this._run);
    }

    async _run(ctx, id, data) {
        this._isAllowed(ctx, "run");
        const obj = await this._getTypeInstance(id);

        assertType(data, "request body", "object");

        // Required parameters
        assertType(data.baseline, "baseline", "object");

        // Optional
        if (data.hasOwnProperty("name")) {
            assertType(data.name, "name", "string");
        }
        if (data.hasOwnProperty("criteria")) {
            assertType(data.criteria, "criteria", "string");
        }
        if (data.hasOwnProperty("initialJobTags")) {
            assertType(data.initialJobTags, "initialJobTags", "array");
        }
        if (data.hasOwnProperty("refs")) {
            assertType(data.initialJobTags, "refs", "array");
        }

        return obj.run(data);
    }
}

module.exports = JobSpecs;
