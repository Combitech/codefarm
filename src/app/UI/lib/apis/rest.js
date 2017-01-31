"use strict";

const api = require("api.io");
const { ServiceMgr } = require("service");

let instance;

const restApiExports = api.register("rest", {
    list: api.export(async (session, type, params = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(`/${typeName}`, params);
    }),
    get: api.export(async (session, type, id, getterName, params = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        let pathname = `/${typeName}/${id}`;
        if (getterName) {
            pathname = pathname.concat("/", getterName);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.get(pathname, params);
    }),
    post: api.export(async (session, type, data) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.post(`/${typeName}`, data);
    }),
    save: api.export(async (session, type, id, data = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.patch(`/${typeName}/${id}`, data);
    }),
    remove: api.export(async (session, type, id, data = {}) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.remove(`/${typeName}/${id}`, data);
    }),
    action: api.export(async (session, type, id, action, data) => {
        const [ serviceId, typeName ] = type.split(".");

        if (!ServiceMgr.instance.has(serviceId)) {
            throw new Error(`No such service, ${serviceId}`);
        }

        const restClient = await ServiceMgr.instance.use(serviceId);

        return await restClient.post(`/${typeName}/${id}/${action}`, data);
    })
});

class RestApi {
    constructor() {
        this.exports = restApiExports;
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
    }

    async dispose() {
    }
}

module.exports = RestApi;
