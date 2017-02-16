"use strict";

const DEFAULT_TIMEOUT_MS = 1000 * 10;

class MbClient {
    constructor(serviceName, msgbus) {
        this.serviceName = serviceName;
        this.msgbus = msgbus;

        return new Proxy(this, {
            get: (target, property) => {
                if (Reflect.has(target, property)) {
                    return Reflect.get(target, property);
                }

                return this.call.bind(this, property);
            }
        });
    }

    async get(typeName, id, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: "get",
            typeName: typeName,
            params: [ id ]
        }, timeout);
    }

    async list(typeName, query, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: "list",
            typeName: typeName,
            params: [ query ]
        }, timeout);
    }

    async create(typeName, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: "create",
            typeName: typeName,
            params: data ? [ data ] : []
        }, timeout);
    }

    async update(typeName, id, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: "update",
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, timeout);
    }

    async remove(typeName, id, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: "remove",
            typeName: typeName,
            params: [ id ]
        }, timeout);
    }

    async call(name, typeName, id, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this.msgbus.request(this.serviceName, {
            method: name,
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, timeout);
    }
}

module.exports = MbClient;
