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

    async get(typeName, id, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: "get",
            typeName: typeName,
            params: [ id ]
        }, opts);
    }

    async list(typeName, query, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: "list",
            typeName: typeName,
            params: [ query ]
        }, opts);
    }

    async create(typeName, data, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: "create",
            typeName: typeName,
            params: data ? [ data ] : []
        }, opts);
    }

    async update(typeName, id, data, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: "update",
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, opts);
    }

    async remove(typeName, id, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: "remove",
            typeName: typeName,
            params: [ id ]
        }, opts);
    }

    async call(name, typeName, id, data, opts) {
        opts = Object.assign({
            timeout: DEFAULT_TIMEOUT_MS
        }, opts);

        return this.msgbus.request(this.serviceName, {
            method: name,
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, opts);
    }
}

module.exports = MbClient;
