"use strict";

const { ServiceComBus } = require("servicecom");
const { assertType, assertProp } = require("misc");
const singleton = require("singleton");
const jsonPath = require("jsonpath-plus");
const clone = require("clone");

const matchRef = (ref, type, id) =>
    type === ref.type && (ref.id.constructor === Array ? ref.id.includes(id) : ref.id === id);

class RefResolver {
    constructor() {
        this.config = {};
    }

    async start(config = {}) {
        this.config = config;
    }

    async validate(event, data) {
        assertType(data.opts, "data.opts", "object");
        assertProp(data.opts, "ref", true);
        assertType(data.opts.ref, "data.opts.ref", "object");
    }

    async resolve(obj, updatedRef = false) {
        return this._resolve(obj.opts.ref, obj.opts.spec, obj.data, updatedRef, obj._id);
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

    async _resolvePath(path, root, updatedRef, sourceId) {
        const refs = [];
        const matches = jsonPath({
            resultType: "all",
            path: path,
            json: root
        });

        for (const obj of matches) {
            // Clone since we add data in the same place and do not want the ref to include the data
            const ref = clone(obj.value);
            delete ref.data;

            const insertRef = obj.parent[obj.parentProperty];
            // Replace data if non-existing or updated
            if (!insertRef.data || !updatedRef || matchRef(ref, updatedRef.type, updatedRef.id)) {
                insertRef.data = await this._get(ref, sourceId);
            }

            refs.push(ref);
        }

        return refs;
    }

    async _resolve(ref, spec = false, oldData, updatedRef = false, sourceId = false) {
        let root = oldData;
        if (!oldData || !updatedRef || matchRef(ref, updatedRef.type, updatedRef.id)) {
            root = await this._get(ref, sourceId);
        }
        let refs = [ ref ];

        if (spec && spec.paths) {
            for (const path of spec.paths) {
                refs = refs.concat(await this._resolvePath(path, root, updatedRef, sourceId));
            }
        }

        return { data: root, refs: refs };
    }

    async dispose() {
    }
}

module.exports = singleton(RefResolver);
