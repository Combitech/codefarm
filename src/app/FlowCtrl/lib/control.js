"use strict";

const { ServiceMgr } = require("service");
const { notification } = require("typelib");
const singleton = require("singleton");
const Step = require("./types/step");

const getNewJobCreatedRefs = (data) => {
    const oldRefs = [];
    const newRefs = [];

    if (data.olddata) {
        for (const run of data.olddata.runs) {
            oldRefs = oldRefs.concat(run.createdRefs);
        }
    }

    for (const run of data.newdata.runs) {
        for (const newRef of run.createdRefs) {
            if (oldRefs.every((ref) => ref.id !== newRef.id && ref.type !== newRef.type)) {
                newRefs.push(newRef);
            }
        }
    }

    return newRefs;
}

class Control {
    constructor() {
    }

    async start() {
        const mb = ServiceMgr.instance.msgBus;

        mb.on("data", async (data) => {
            if (data.type === "baselinegen.baseline" &&
                data.event === "created") {
                const steps = await Step.findMany({ "baseline.id": data.newdata.name });

                for (const step of steps) {
                    try {
                        await step.triggerJob(data.newdata);
                    } catch (error) {
                        ServiceMgr.instance.log("error", `Trigger job failed for step ${step._id}`, JSON.stringify(error, null, 2));
                        throw error;
                    }
                }
            } else if (data.type === "exec.job" &&
                       data.event === "updated" &&
                       data.olddata.finished !== data.newdata.finished) {
                const steps = await Step.findMany({ "jobs.jobId": data.newdata._id });

                for (const step of steps) {
                    try {
                        await step.finishJob(data.newdata._id, data.newdata.status);
                    } catch (error) {
                        ServiceMgr.instance.log("error", `Finish job failed for step ${step._id}`, JSON.stringify(error, null, 2));
                    }
                }
            } else if (data.type === "exec.job" &&
                       data.event === "updated" &&
                       data.olddata.status !== data.newdata.status) {
                const steps = await Step.findMany({ "jobs.jobId": data.newdata._id });

                for (const step of steps) {
                    try {
                        await step.jobStatusUpdated(data.newdata._id, data.newdata.status);
                    } catch (error) {
                        ServiceMgr.instance.log("error", `Job status update failed for step ${step._id}`, JSON.stringify(error, null, 2));
                    }
                }
            } else if (data.type === "exec.job" &&
                       data.event === "updated") {
                const newCreatedRefs = getNewJobCreatedRefs(data);

                if (newCreatedRefs.length > 0) {
                    const steps = await Step.findMany({ "jobs.jobId": data.newdata._id });

                    for (const step of steps) {
                        try {
                            await step.jobNewCreatedRefs(data.newdata._id, newCreatedRefs);
                        } catch (error) {
                            ServiceMgr.instance.log("error", `Job new created refs failed for step ${step._id}`, JSON.stringify(error, null, 2));
                        }
                    }
                }
            }
        });

        notification.on("step.created", async (step) => {
            step.evaluateStatus();
        });

        notification.on("flow.removed", async (flow) => {
            const steps = await Step.findMany({ flow: flow._id });

            for (const step of steps) {
                await step.remove();
            }
        });

        notification.on("step.removed", async (step) => {
            // Do not save step since that will re-create it...
            await step.abortJobs(false);

            // TODO: Remove substep
        });

        const steps = await Step.findMany();

        for (const step of steps) {
            await step.evaluateStatus(true);
        }
    }

    async dispose() {
    }
}

module.exports = singleton(Control);
