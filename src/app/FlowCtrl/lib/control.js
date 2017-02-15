"use strict";

const { serviceMgr } = require("service");
const { notification } = require("typelib");
const Step = require("./types/step");

let instance;

class Control {
    constructor() {
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        const mb = serviceMgr.msgBus;

        mb.on("data", async (data) => {
            if (data.type === "baselinegen.baseline" &&
                data.event === "created") {
                const steps = await Step.findMany({ baseline: data.newdata.name });

                for (const step of steps) {
                    try {
                        await step.triggerJob(data.newdata);
                    } catch (error) {
                        console.error(JSON.stringify(error, null, 2))
                    }
                }
            } else if (data.type === "exec.job" &&
                       data.event === "updated" &&
                       data.olddata.finished !== data.newdata.finished) {
                const steps = await Step.findMany({ "jobs.jobId": data.newdata._id });

                for (const step of steps) {
                    await step.finishJob(data.newdata._id, data.newdata.status);
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
            await step.abortJobs();

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

module.exports = Control;
