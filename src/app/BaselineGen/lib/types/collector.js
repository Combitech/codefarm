"use strict";

const { serviceMgr } = require("service");
const { Type, notification } = require("typelib");
const { TagCriteria } = require("misc");

class Collector extends Type {
    constructor(data) {
        super();

        this.baseline = false; // Name of the baseline === specification._id
        this.name = false; // User defined collector name
        this.collectType = false; // Type to collect
        this.criteria = false; // Tag criteria to match to events
        this.limit = false; // Limit to how many things to collect
        this.latest = false; // If collector limit is reach and latest is true, treat as a FIFO stack
        this.ready = false; // Set to time if collector has all the data to be included in a generated baseline
        this.completed = false; // Set to time if collector has been filled and can not collect anything more
        this.requested = false; // Set to time if the collector has been requested by FlowCtrl or some such
        this.used = false; // Set if collector has been included in a generated baseline and is now dead, or should not be used again
        this.ids = []; // List of collected ids

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "collector";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
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
        const collectors = await Collector.findMany({ baseline: baselineName, used: false });

        for (const collector of collectors) {
            collector.completed = collector.completed || new Date();
            collector.used = new Date();
            await collector.save();
        }

        return collectors.length > 0 ? collectors[0].requested : false;
    }

    static async findLatest(baselineName) {
        const collectors = await Collector.findMany({ baseline: baselineName, used: false });
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
        const collectors = await Collector.findMany({ completed: false });

        return collectors.filter((collector) => collector.match(event));
    }

    match(event) {
        if (this.completed) {
            return false;
        }

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

    async update(event) {
        this.ids.push(event.newdata._id);

        // limit === 0 means collect any number
        // latest === true will replace the oldest
        if (this.limit > 0) {
            if (this.latest && this.ids.length > this.limit) {
                // We will not set completed since the collector
                // has the collect latest flag. But we will only
                // start removing when the limit is reached.
                this.ids.shift();

                // If the collector limit has been reached it is ready
                this.ready = new Date();
            } else if (!this.latest && this.ids.length >= this.limit) {
                // If we do not have the collect latest flag we should
                // set the collector completed if we have reached the
                // limit.
                this.completed = new Date();
                this.ready = new Date();
            }
        } else {
            // If we have no limit it is ready after the first update
            this.ready = new Date();
        }

        await this.save();

        if (this.ready) {
            await notification.emit(`${this.constructor.typeName}.ready`, this);
        }
    }
}

module.exports = Collector;
