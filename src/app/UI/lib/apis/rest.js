"use strict";

const api = require("api.io");
const { ServiceComBus } = require("servicecom");
const singleton = require("singleton");

const restApiExports = api.register("rest", {
    list: api.export(async (session, type, query = {}) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.list(typeName, query, { token });
    }),
    get: api.export(async (session, type, id, getterName) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[getterName || "get"](typeName, id, { token });
    }),
    save: api.export(async (session, type, id, data = {}) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.update(typeName, id, data, { token });
    }),
    remove: api.export(async (session, type, id) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.remove(typeName, id, { token });
    }),
    action: api.export(async (session, type, id, action, data = {}) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client[action](typeName, id, data, { token });
    }),
    post: api.export(async (session, type, data) => {
        const token = session.user && session.user.token;
        const [ serviceId, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceId);

        return client.create(typeName, data, { token });
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
