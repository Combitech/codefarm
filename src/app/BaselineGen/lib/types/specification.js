"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Specification extends Type {
    constructor(data) {
        super();

        this.collectors = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "specification";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    static async getCollectorDefinition(baselineId, collectorName) {
        const specification = await this.findOne({ _id: baselineId });

        if (!specification) {
            return false;
        }

        return specification.collectors.filter((data) => data.name === collectorName)[0] || false;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", true);
            assertType(data._id, "data._id", "string");
            assertProp(data, "collectors", true);
            assertType(data.collectors, "data.collectors", "array");
        } else if (event === "update") {
            assertProp(data, "_id", false);
        }

        if (data.collectors) {
            for (const collector of data.collectors) {
                if (collector.limit) {
                    collector.limit = parseInt(collector.limit, 10);
                }

                if (collector.latest === "true" || collector.latest === "false") {
                    collector.latest = JSON.parse(collector.latest);
                }

                assertProp(collector, "name", true);
                assertType(collector.name, "collector.name", "string");
                assertProp(collector, "collectType", true);
                assertType(collector.collectType, "collector.collectType", "string");
                assertProp(collector, "criteria", true);
                assertType(collector.criteria, "collector.criteria", "string");
                assertProp(collector, "limit", true);
                assertType(collector.limit, "collector.limit", "number");
                assertProp(collector, "latest", true);
                assertType(collector.latest, "collector.latest", "boolean");
            }
        }
    }
}

module.exports = Specification;
