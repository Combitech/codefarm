"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const { TagCriteria } = require("misc");

const STATES = {
    // Collector does not have enough data to be included in a baseline
    NOT_READY: "not_ready",

    // Collector has all the data to be included in a generated baseline
    READY: "ready",

    // Collector has been filled and can not collect anything more
    COMPLETED: "completed",

    // Collector has been included in a generated baseline and is now dead, or should not be used again
    USED: "used",

    // Collector has been forcefully stopped
    STOPPED: "stopped"
};

class Collector extends Type {
    constructor(data) {
        super();

        this.baseline = false; // Name of the baseline === specification._id
        this.name = false; // User defined collector name
        this.collectType = false; // Type to collect
        this.criteria = false; // Tag criteria to match to events
        this.limit = false; // Limit to how many things to collect
        this.latest = false; // If collector limit is reach and latest is true, treat as a FIFO stack
        this.ids = []; // List of collected ids
        this.requested = false; // Set to time if the collector has been requested by FlowCtrl or some such

        this.previousState = STATES.NOT_READY;
        this.state = STATES.NOT_READY;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "collector";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async createFromSpecificationData(baselineName, data, requested = false) {
        const collector = new Collector({
            baseline: baselineName,
            name: data.name,
            collectType: data.collectType,
            criteria: data.criteria,
            limit: data.limit,
            latest: data.latest,
            requested: requested
        });

        await collector.save();
    }

    static async stopAllByBaselineName(baselineName) {
        const collectors = await Collector.findMany({
            baseline: baselineName,
            state: {
                $in: [
                    STATES.NOT_READY,
                    STATES.READY,
                    STATES.COMPLETED
                ]
            }
        });

        for (const collector of collectors) {
            await collector.setState(STATES.STOPPED);
        }

        return collectors.length > 0 ? collectors[0].requested : false;
    }

    static async findLatest(baselineName) {
        const collectors = await Collector.findMany({
            baseline: baselineName,
            state: {
                $in: [
                    STATES.NOT_READY,
                    STATES.READY,
                    STATES.COMPLETED
                ]
            }
        });
        const group = {};

        for (const collector of collectors) {
            if (!group[collector.name] ||
                group[collector.name].created > collector.created) {
                group[collector.name] = collector;
            }
        }

        return Object.keys(group).map((key) => group[key]);
    }

    static async findMatching(event) {
        const collectors = await Collector.findMany({
            state: {
                $in: [
                    STATES.NOT_READY,
                    STATES.READY
                ]
            }
        });

        return collectors.filter((collector) => collector.match(event));
    }

    match(event) {
        if (this.collectType !== event.type) {
            return false;
        }

        const criteria = new TagCriteria(this.criteria);

        // If the old tags matched we should already
        // have used this type and should ignore it
        if (event.olddata && criteria.match(event.olddata.tags)) {
            return false;
        }

        if (!criteria.match(event.newdata.tags)) {
            return false;
        }

        return true;
    }

    async setState(state) {
        if (state === this.state) {
            return;
        }

        this.previousState = this.state;
        this.state = state;

        await this.save();
    }

    async update(event) {
        this.ids.push(event.typeId);

        // limit === 0 means collect any number
        // latest === true will replace the oldest
        if (this.limit > 0) {
            if (this.latest && this.ids.length > this.limit) {
                // We will not set completed since the collector
                // has the collect latest flag. But we will only
                // start removing when the limit is reached.
                this.ids.shift();

                // If the collector limit has been reached it is ready
                await this.setState(STATES.READY); // This does a save, to save change in ids also
            } else if (!this.latest && this.ids.length >= this.limit) {
                // If we do not have the collect latest flag we should
                // set the collector completed if we have reached the
                // limit.
                await this.setState(STATES.COMPLETED);
            }
        } else {
            // If we have no limit it is ready after the first update
            await this.setState(STATES.READY);
        }
    }
}

Collector.STATES = STATES;

module.exports = Collector;
