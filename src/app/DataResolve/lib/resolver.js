"use strict";

const { ServiceMgr } = require("service");
const jsonPath = require("jsonpath-plus");
const clone = require("clone");

let instance;

const matchRef = (ref, type, id) =>
    type === ref.type && (ref.id.constructor === Array ? ref.id.includes(id) : ref.id === id);

class Resolver {
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

    async _get(ref, sourceId) {
        if (this.config.testMode) {
            return this.config.getTestData(ref, sourceId);
        }

        const [ serviceId, typeName ] = ref.type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        if (ref.id.constructor === Array) {
            let result = [];
            if (ref.id.length > 0) {
                result = await restClient.get(`/${typeName}`, {
                    _id: {
                        $in: ref.id
                    }
                });
            }

            return result;
        }

        return await restClient.get(`/${typeName}/${ref.id}`, {});
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

    async resolve(ref, spec = false, oldData, updatedRef = false, sourceId = false) {
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

module.exports = Resolver;
