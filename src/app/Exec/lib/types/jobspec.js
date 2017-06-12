"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const Job = require("./job");

const CLEANUP_POLICY = { // Keep in sync with same list in Exec job
    KEEP: "keep",
    REMOVE_ON_FINISH: "remove_on_finish",
    REMOVE_ON_SUCCESS: "remove_on_success",
    REMOVE_WHEN_NEEDED: "remove_when_needed"
};

class JobSpec extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.criteria = false;
        this.script = false;
        this.workspaceName = false;
        this.workspaceCleanup = CLEANUP_POLICY.KEEP;
        this.initialJobTags = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "jobspec";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "name", true);
        assertType(data.name, "data.name", "string");
        assertProp(data, "criteria", true);
        assertType(data.criteria, "data.criteria", "string");
        assertProp(data, "script", true);
        assertType(data.script, "data.script", "string");
        // TODO: Validate workspaceName and workspaceCleanup
    }

    async run(jobData) {
        const data = Object.assign({
            name: this.name,
            criteria: this.criteria,
            script: this.script,
            workspaceName: this.workspaceName,
            workspaceCleanup: this.workspaceCleanup,
            jobSpec: this.getRef(this.name),
            tags: []
        }, jobData);

        const newTagsFromJobSpec = this.initialJobTags.filter((tag) => !data.tags.includes(tag));
        data.tags.splice(data.tags.length, 0, ...newTagsFromJobSpec);

        const job = new Job(data);
        await job.save();

        return job;
    }
}

JobSpec.CLEANUP_POLICY = CLEANUP_POLICY;

module.exports = JobSpec;
