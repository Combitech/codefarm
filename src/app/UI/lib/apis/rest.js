"use strict";

const api = require("api.io");
const { ServiceComBus } = require("servicecom");

let instance;

const restApiExports = api.register("rest", {
    list: api.export(async (session, type, query = {}) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.list(typeName, query);
    }),
    get: api.export(async (session, type, id, getterName) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[getterName || "get"](typeName, id);
    }),
    save: api.export(async (session, type, id, data = {}) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.update(typeName, id, data);
    }),
    remove: api.export(async (session, type, id) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.remove(typeName, id);
    }),
    action: api.export(async (session, type, id, action, data) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[action](typeName, id, data);
    }),
    post: api.export(async (session, type, data) => {
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.create(typeName, data);
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
