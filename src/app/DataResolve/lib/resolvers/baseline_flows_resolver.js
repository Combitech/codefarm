"use strict";

const { ServiceComBus } = require("servicecom");
const { assertType, assertProp } = require("misc");

let instance;

const typeToRef = (item) => ({
    _ref: true,
    id: item._id,
    type: item.type
});

class BaselineFlowsResolver {
    constructor() {
        this.config = {};
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start(config = {}) {
        this.config = config;
    }

    async validate(event, data) {
        assertType(data.opts, "data.opts", "object");
        assertProp(data.opts, "baselineName", true);
        assertType(data.opts.baselineName, "data.opts.baselineName", "string");
    }

    async resolve(obj, updatedRef = false) {
        return this._resolve(obj.opts, obj.data, updatedRef);
    }

    async _get(ref, sourceId) {
        if (this.config.testMode) {
            return this.config.getTestData(ref, sourceId);
        }

        const [ serviceId, typeName ] = ref.type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        if (ref.id.constructor === Array) {
            let result = [];
            if (ref.id.length > 0) {
                result = await client.list(typeName, {
                    _id: {
                        $in: ref.id
                    }
                });
            }

            return result;
        }

        return await client.get(typeName, ref.id);
    }

    async _list(type, query) {
        if (this.config.testMode) {
            return this.config.getTestDataList(type, query);
        }

        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return await client.list(typeName, query);
    }

    async _resolve(opts, oldData, updatedRef = false) {
        let root = oldData;
        let refs = [];

        if (!oldData || updatedRef) {
            const steps = await this._list("flowctrl.step", {
                "baseline.id": opts.baselineName
            });

            let flowIds = null;

            if (steps) {
                // Take flowId from all steps and remove duplicates
                flowIds = steps
                    .map((step) => step.flow.id)
                    .filter((flowId, index, self) => self.indexOf(flowId) === index);

                // Steps may update, we need to watch these
                refs = refs.concat(steps.map(typeToRef));
            }

            let flows = [];

            if (flowIds && flowIds.length > 0) {
                flows = await this._list("flowctrl.flow", {
                    _id: { $in: flowIds }
                });
                refs = refs.concat(flows.map(typeToRef));
            }
            root = flows;
        }

        return { data: root, refs: refs };
    }

    async dispose() {
    }
}

module.exports = BaselineFlowsResolver;
