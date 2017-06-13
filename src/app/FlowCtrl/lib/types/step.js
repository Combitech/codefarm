"use strict";

const vm = require("vm");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { assertType, assertProp, ensureArray } = require("misc");
const { Type } = require("typelib");

class Step extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.flow = false;
        this.schedule = false;
        this.concurrency = 1;
        this.baseline = false;
        this.jobSpec = false;
        this.connectedFlow = false;
        this.tagScript = false;
        this.parentSteps = [];
        this.visible = true;
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

        assertProp(data, "name", true);
        assertType(data.name, "data.name", "string");
        assertProp(data, "flow", true);
        assertType(data.flow, "data.flow", "ref");
        assertProp(data, "concurrency", true);
        assertType(data.concurrency, "data.concurrency", "number");
        assertProp(data, "baseline", true);
        assertType(data.baseline, "data.baseline", "ref");
        assertProp(data, "jobSpec", true);
        if (data.jobSpec !== false) { // False is allowed
            assertType(data.baseline, "data.jobSpec", "ref");
        }

        if (data.connectedFlow !== false) { // False is allowed
            assertType(data.connectedFlow, "data.connectedFlow", "ref");
        }

        if (data.hasOwnProperty("initialJobTags")) {
            assertType(data.initialJobTags, "data.initialJobTags", "array");
        }
    }

    async _doActionOnBaseline(baseline, actionFn) {
        for (const ref of baseline.content) {
            const [ serviceId, typeName ] = ref.type.split(".");
            const client = ServiceComBus.instance.getClient(serviceId);

            const ids = ensureArray(ref.id);

            for (const id of ids) {
                await actionFn(client, typeName, {
                    _ref: true,
                    id: id,
                    type: ref.type,
                    name: ref.name
                });
            }
        }
    }

    async evaluateStatus(evaluateJobs = false) {
        if (evaluateJobs) {
            if (this.jobs.length > 0) {
                const jobs = this.jobs.slice(0);
                const jobIds = jobs.map((job) => job.jobId);
                const client = ServiceComBus.instance.getClient("exec");

                try {
                    const foundJobs = await client.list("job", {
                        _id: {
                            $in: jobIds
                        }
                    });

                    for (const job of jobs) {
                        const foundJob = foundJobs.find((fj) => fj._id === job.jobId);

                        if (!foundJob || foundJob.finished) {
                            ServiceMgr.instance.log("info", `Step ${this.name} found job ${job.jobId} which has finished or is missing, performing step job finish`);
                            await this.finishJob(job.jobId, foundJob ? foundJob.status : "unknown");
                        }
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
        if (!this.jobSpec) {
            ServiceMgr.instance.log("verbose", `Step ${this.name} trigger job: no jobspec, finalizing step`);
            await this.evaluateStatus();
            await this.notifyStatus(baseline, "success");
            await this.runTagScript();

            return;
        }

        ServiceMgr.instance.log("verbose", `Step ${this.name} trigger job: starting job from exec.jobspec ${this.jobSpec.id}`);

        const client = ServiceComBus.instance.getClient("exec");

        const jobCreateData = {
            name: this.name,
            criteria: this.criteria,
            baseline: baseline,
            tags: this.initialJobTags,
            refs: [ {
                _ref: true,
                type: this.type,
                id: this._id,
                name: "step"
            } ]
        };

        if (!jobCreateData.criteria) {
            delete jobCreateData.criteria;
        }

        const data = await client.run("jobspec", this.jobSpec.id, jobCreateData);
        ServiceMgr.instance.log("verbose", `Step ${this.name} trigger job: job ${data._id} started`);

        this.jobs.push({ jobId: data._id, baseline: baseline });
        await this.save();

        // Add add ref to the job to the items in the baseline
        await this._doActionOnBaseline(baseline, async (client, typeName, ref) => {
            await client.addref(typeName, ref.id, {
                ref: {
                    _ref: true,
                    id: data._id,
                    type: data.type,
                    name: this.name
                }
            });
        });

        // TODO: It is possible that the job has finished by now... What if finishJob already has completed?
        await this.notifyStatus(baseline, data.status);
    }

    async jobStatusUpdated(jobId, status) {
        const job = this.jobs.find((job) => job.jobId === jobId);

        if (job) {
            await this.notifyStatus(job.baseline, status);
        }
    }

    async jobNewCreatedRefs(jobId, createdRefs) {
        const job = this.jobs.find((job) => job.jobId === jobId);

        if (job) {
            await this._doActionOnBaseline(job.baseline, async (client, typeName, ref) => {
                await client.addderivativeref(typeName, ref.id, {
                    ref: createdRefs
                });
            });
        }
    }

    async abortJobs(save = true) {
        const client = ServiceComBus.instance.getClient("exec");
        const jobs = this.jobs;

        this.jobs.length = 0;

        if (save) {
            await this.save();
        }

        for (const job of jobs) {
            await client.remove("job", job.jobId);
            await this.notifyStatus(job.baseline, "aborted");
        }
    }

    async finishJob(jobId, result) {
        ServiceMgr.instance.log("verbose", `Step ${this.name} finish job: jobId=${jobId}, result=${result}`);
        const index = this.jobs.findIndex((job) => job.jobId === jobId);
        const job = this.jobs[index];

        this.jobs.splice(index, 1);
        await this.save();

        await this.evaluateStatus();
        await this.notifyStatus(job.baseline, result);
        await this.runTagScript(jobId, job.baseline, result);
    }

    async runTagScript(jobId, baseline, result) {
        if (!this.tagScript) {
            ServiceMgr.instance.log("verbose", `Step ${this.name} run tag script: no tag script`);

            return;
        }

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
            tags: [],
            untag: []
        };

        ServiceMgr.instance.log("verbose", `Step ${this.name} run tag script: running script`);

        // Collecting data from baseline before running tag script
        await this._doActionOnBaseline(baseline, async (client, typeName, ref) => {
            sandbox.data.content[ref.name] = sandbox.data.content[ref.name] || [];
            sandbox.data.content[ref.name].push(await client.get(typeName, ref.id));
        });

        // Run the tag script
        const script = new vm.Script(this.tagScript);
        script.runInNewContext(sandbox);

        // Tag all items in the baseline with the output from the tag script
        await this._doActionOnBaseline(baseline, async (client, typeName, ref) => {
            if (sandbox.tags.length > 0) {
                await client.tag(typeName, ref.id, {
                    tag: sandbox.tags
                });
            }

            if (sandbox.untag.length > 0) {
                await client.untag(typeName, ref.id, {
                    tag: sandbox.untag
                });
            }
        });
    }

    async notifyStatus(baseline, status) {
        const baseTag = `step:${this.name}`;
        const statusTag = `${baseTag}:${status}`;

        // Important to tag baseline after baseline content has been tagged!
        const client = ServiceComBus.instance.getClient("baselinegen");

        await client.replacetag("baseline", baseline._id, {
            replace: baseTag,
            tag: statusTag
        });

        // Update status tag and baseline content
        await this._doActionOnBaseline(baseline, async (client, typeName, ref) => {
            await client.replacetag(typeName, ref.id, {
                replace: baseTag,
                tag: statusTag
            });
        });
    }
}

module.exports = Step;
