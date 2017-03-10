"use strict";

const api = require("api.io");
const { ServiceComBus } = require("servicecom");
const singleton = require("singleton");
const { checkAuthorized } = require("./_util.js");

const restApiExports = api.register("rest", {
    list: api.export(async (session, type, query = {}) => {
        checkAuthorized(session, type, "read");
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.list(typeName, query);
    }),
    get: api.export(async (session, type, id, getterName) => {
        checkAuthorized(session, type, "read");
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[getterName || "get"](typeName, id);
    }),
    save: api.export(async (session, type, id, data = {}) => {
        checkAuthorized(session, type, "update");
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.update(typeName, id, data);
    }),
    remove: api.export(async (session, type, id) => {
        checkAuthorized(session, type, "remove");
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.remove(typeName, id);
    }),
    action: api.export(async (session, type, id, action, data) => {
        checkAuthorized(session, type, action);
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[action](typeName, id, data);
    }),
    post: api.export(async (session, type, data) => {
        checkAuthorized(session, type, "create");
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.create(typeName, data);
    })
});

class RestApi {
    constructor() {
        this.exports = restApiExports;
    }

    async start() {
    }

    async dispose() {
    }
}

module.exports = singleton(RestApi);
