"use strict";

const vm = require("vm");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

const CLEANUP_POLICY = { // Keep in sync with same list in Exec job
    KEEP: "keep",
    REMOVE_ON_FINISH: "remove_on_finish",
    REMOVE_ON_SUCCESS: "remove_on_success",
    REMOVE_WHEN_NEEDED: "remove_when_needed"
};

class Step extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.flow = false;
        this.schedule = false;
        this.concurrency = 1;
        this.baseline = false;
        this.criteria = false;
        this.script = false;
        this.tagScript = false;
        this.parentSteps = [];
        this.visible = true;
        this.workspaceName = false;
        this.workspaceCleanup = CLEANUP_POLICY.KEEP;
        this.initialJobTags = [];

        this.jobs = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "step";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        assertProp(data, "jobIds", false);

        if (data.concurrency) {
            data.concurrency = parseInt(data.concurrency, 10);
        }

        if (event === "create") {
            assertProp(data, "name", true);
            assertType(data.name, "data.name", "string");
            assertProp(data, "flow", true);
            assertType(data.flow, "data.flow", "ref");
            assertProp(data, "concurrency", true);
            assertType(data.concurrency, "data.concurrency", "number");
            assertProp(data, "baseline", true);
            assertType(data.baseline, "data.baseline", "ref");
            if (data.hasOwnProperty("initialJobTags")) {
                assertType(data.initialJobTags, "data.initialJobTags", "array");
            }
            // assertType(data.script, "data.parentSteps", "array"); TODO: This does not work correctly
            // TODO: Check workspace and cleanup policy
        }
    }

    async evaluateStatus(evaluateJobs = false) {
        if (evaluateJobs) {
            if (this.jobs.length > 0) {
                const jobIds = this.jobs.map((job) => job.jobId);
                const client = ServiceComBus.instance.getClient("exec");

                try {
                    const finishedJobs = await client.list("job", {
                        _id: {
                            $in: jobIds
                        },
                        finished: {
                            $ne: false
                        }
                    });

                    for (const job of finishedJobs) {
                        ServiceMgr.instance.log("info", `Step ${this.name} found job ${job._id} which has finished, performing step job finish`);
                        await this.finishJob(job._id, job.status);
                    }
                } catch (error) {
                    ServiceMgr.instance.log("error", `Step ${this.name} failed to request finished jobs`, error);
                }
            }
        }

        if (!this.schedule) {
            if (this.jobs.length < this.concurrency) {
                try {
                    await this.requestBaseline();
                } catch (error) {
                    ServiceMgr.instance.log("error", `Step ${this.name} failed to request baseline ${this.baseline.id}`, error);
                }
            }
        } else {
            // TODO: Check time against schedule
        }
    }

    async requestBaseline() {
        const client = ServiceComBus.instance.getClient("baselinegen");

        ServiceMgr.instance.log("verbose", `Step ${this.name} requesting baseline ${this.baseline.id}`);

        await client.request("specification", this.baseline.id);
    }

    async triggerJob(baseline) {
        if (!this.script) {
            await this.evaluateStatus();

            return await this.runTagScript(null, baseline, "success");
        }

        ServiceMgr.instance.log("verbose", `Step ${this.name} creating exec.job`);

        const client = ServiceComBus.instance.getClient("exec");

        const data = await client.create("job", {
            name: this.name,
            criteria: this.criteria,
            script: this.script,
            baseline: baseline,
            workspaceName: this.workspaceName,
            workspaceCleanup: this.workspaceCleanup,
            tags: this.initialJobTags
        });

        this.jobs.push({ jobId: data._id, baseline: baseline });
        await this.save();

        for (const ref of baseline.content) {
            const [ serviceId, typeName ] = ref.type.split(".");
            const client = ServiceComBus.instance.getClient(serviceId);

            for (const id of ref.id) {
                await client.addref(typeName, id, {
                    ref: {
                        _ref: true,
                        id: data._id,
                        type: data.type,
                        name: this.name
                    }
                });
            }
        }
    }

    async abortJobs() {
        const client = ServiceComBus.instance.getClient("exec");

        const jobIds = this.jobs.map((job) => job.jobId);
        this.jobs.length = 0;
        await this.save();

        for (const jobId of jobIds) {
            await client.remove("job", jobId);
        }
    }

    async finishJob(jobId, result) {
        ServiceMgr.instance.log("verbose", `Step ${this.name} finishing job, result=${result}`);
        const index = this.jobs.findIndex((job) => job.jobId === jobId);
        const job = this.jobs[index];

        this.jobs.splice(index, 1);
        await this.save();

        await this.evaluateStatus();

        await this.runTagScript(jobId, job.baseline, result);
    }

    async runTagScript(jobId, baseline, result) {
        const defaultTag = `step:${this.name}:${result}`;
        const sandbox = {
            data: {
                id: this._id,
                name: this.name,
                jobId: jobId,
                flowId: this.flow.id,
                baselineId: baseline._id,
                content: {},
                result: result
            },
            tags: [ defaultTag ],
            untag: []
        };

        if (this.tagScript) {
            ServiceMgr.instance.log("verbose", `Step ${this.name} running tag script`);
            for (const ref of baseline.content) {
                const [ serviceId, typeName ] = ref.type.split(".");
                const client = ServiceComBus.instance.getClient(serviceId);

                sandbox.data.content[ref.name] = [];

                for (const id of ref.id) {
                    sandbox.data.content[ref.name].push(await client.get(typeName, id));
                }
            }

            const script = new vm.Script(this.tagScript);
            script.runInNewContext(sandbox);
        }

        for (const ref of baseline.content) {
            const [ serviceId, typeName ] = ref.type.split(".");
            const client = ServiceComBus.instance.getClient(serviceId);

            for (const id of ref.id) {
                if (sandbox.tags.length > 0) {
                    await client.tag(typeName, id, {
                        tag: sandbox.tags
                    });
                }

                if (sandbox.untag.length > 0) {
                    await client.untag(typeName, id, {
                        tag: sandbox.untag
                    });
                }
            }
        }

        // Important to tag baseline after baseline content has been tagged!
        const client = ServiceComBus.instance.getClient("baselinegen");

        await client.tag("baseline", baseline._id, {
            tag: defaultTag
        });
    }
}

module.exports = Step;
