"use strict";

const { synchronize } = require("misc");
const { ServiceMgr } = require("service");
const { notification } = require("typelib");
const singleton = require("singleton");
const Specification = require("./types/specification");
const Collector = require("./types/collector");
const Baseline = require("./types/baseline");

class Control {
    constructor() {
        synchronize(this, "update");
        synchronize(this, "generate");
    }

    async start() {
        const mb = ServiceMgr.instance.msgBus;

        notification.on("specification.created", async (specification) => {
            for (const data of specification.collectors) {
                await Collector.createFromSpecificationData(specification._id, data);
            }
        });

        notification.on("specification.updated", async (specification) => {
            const requested = await Collector.stopAllByBaselineName(specification._id);

            for (const data of specification.collectors) {
                await Collector.createFromSpecificationData(specification._id, data, requested);
            }
        });

        notification.on("specification.removed", async (specification) => {
            await Collector.stopAllByBaselineName(specification._id);
        });

        // TODO: Handle specification update which adds new and remove

        notification.on("collector.updated", async (collector) => {
            if (collector.previousState === Collector.STATES.NOT_READY &&
                collector.state === Collector.STATES.READY) {
                ServiceMgr.instance.log("info", `Collector ${collector.name} updated: Transition ${Collector.STATES.NOT_READY} to ${Collector.STATES.READY}, calling generate`);
                await this.generate(collector.baseline, false);
            } else if (collector.previousState === Collector.STATES.NOT_READY &&
                       collector.state === Collector.STATES.COMPLETED) {
                ServiceMgr.instance.log("info", `Collector ${collector.name} updated: Transition ${Collector.STATES.NOT_READY} to ${Collector.STATES.COMPLETED}, calling generate and spawn`);
                await this.generate(collector.baseline, false);
                await this.spawnNewCollector(collector);
            } else if (collector.previousState === Collector.STATES.READY &&
                       collector.state === Collector.STATES.USED) {
                ServiceMgr.instance.log("info", `Collector ${collector.name} updated: Transition ${Collector.STATES.READY} to ${Collector.STATES.USED}, calling spawn`);
                await this.spawnNewCollector(collector);
            } else if (collector.previousState === Collector.STATES.COMPLETED &&
                       collector.state === Collector.STATES.USED) {
                ServiceMgr.instance.log("info", `Collector ${collector.name} updated: Transition ${Collector.STATES.COMPLETED} to ${Collector.STATES.USED}, doing nothing`);
                // Do nothing
            }
        });

        notification.on("specification.request", async (specification) => {
            ServiceMgr.instance.log("info", `Baseline ${specification._id} requested`);
            await this.generate(specification._id, true);
        });

        mb.on("data", async (event) => {
            await this.update(event);
        });
    }

    async spawnNewCollector(collector) {
        ServiceMgr.instance.log("info", `Will try to spawn new collector, ${collector.name} for baseline ${collector.baseline}`);
        const data = await Specification.getCollectorDefinition(collector.baseline, collector.name);

        if (data) {
            ServiceMgr.instance.log("info", `Found collector specification and will create new collector, ${collector.name} for baseline ${collector.baseline}`);
            await Collector.createFromSpecificationData(collector.baseline, data);
        }
    }

    async update(event) {
        if (event.event === "created" || event.event === "updated") {
            const collectors = await Collector.findMatching(event);

            for (const collector of collectors) {
                await collector.update(event);
            }
        }
    }

    async generate(baselineName, request = false) {
        const collectors = await Collector.findLatest(baselineName);

        if (collectors.length === 0) {
            ServiceMgr.instance.log("error", `Got zero collectors for baseline ${baselineName}`);

            return;
        }

        const readyCollectors = collectors.filter((collector) => collector.state === Collector.STATES.READY || collector.state === Collector.STATES.COMPLETED);

        if (readyCollectors.length !== collectors.length) {
            ServiceMgr.instance.log("info", `Baseline ${baselineName} was requested but only ${readyCollectors.length} or ${collectors.length} are ready or completed`);

            if (request) {
                for (const collector of collectors) {
                    if (!collector.requested) {
                        collector.requested = new Date();
                        await collector.save();
                    }
                }
            }

            return;
        }

        if (request || collectors[0].requested) {
            for (const collector of collectors) {
                await collector.setState(Collector.STATES.USED);
            }

            ServiceMgr.instance.log("info", `Baseline ${baselineName} will be generated now`);
            const baseline = new Baseline({
                name: baselineName,
                content: collectors.map((collector) => ({
                    _ref: true,
                    name: collector.name,
                    type: collector.collectType,
                    id: collector.ids
                }))
            });

            await baseline.save();
        }
    }

    async dispose() {
        notification.removeAllListeners("specification.created");
        notification.removeAllListeners("collector.updated");
        notification.removeAllListeners("specification.request");
    }
}

module.exports = singleton(Control);
