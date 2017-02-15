"use strict";

const os = require("os");
const moment = require("moment");
const { Deferred } = require("misc");

const DEFAULT_TIMEOUT_MS = 1000 * 10;

class MbClient {
    constructor(serviceName, msgbus, name) {
        this.serviceName = serviceName;
        this.msgbus = msgbus;
        this.requests = [];

        this.msgbus.on("data", this._onResponse.bind(this));

        return new Proxy(this, {
            get: (target, property) => {
                if (Reflect.has(target, property)) {
                    return Reflect.get(target, property);
                }

                return this.call.bind(this, property);
            }
        });
    }

    _addRequest(request) {
        this.requests.push(request);

        if (request.timeout) {
            request.timer = setTimeout(() => {
                const r = this._retreiveRequest(request.message._id);

                if (r) {
                    console.error("Request timed out ", JSON.stringify(message, null, 2));
                    request.deferred.reject("Request timed out");
                }
            }, request.timeout);
        }
    }

    _retreiveRequest(id) {
        const index = this.requests.findIndex((request) => request.message._id === id);

        if (index == -1) {
            return false;
        }

        const request =  this.requests.splice(index, 1)[0];

        if (request.timer) {
            clearTimeout(request.timer);
            request.timer = null;
        }

        return request;
    }

    async _onResponse(message) {
        if (message.type !== "response") {
            return;
        }

        const request = this._retreiveRequest(message._id);

        if (message.result !== "success") {

            const error = new Error(message.data);
            error.status = message.status;

            request.deferred.reject(error);
        } else {
            request.deferred.resolve(message.data);
        }
    }

    async _request(data, timeout) {
        const request = {
            message: {
                _id: this.msgbus.constructor.generateId(),
                time: moment().utc().format(),
                type: "request",
                data: data,
                timeout: timeout,
                source: {
                    hostname: os.hostname(),
                    service: this.msgbus.getRoutingKey()
                }
            },
            timeout: timeout,
            deferred: new Deferred()
        };

        this._addRequest(request);

        await this.msgbus.publishRaw(request.message, this.serviceName, timeout);

        return request.deferred.promise;
    }

    async get(typeName, id, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: "get",
            typeName: typeName,
            params: [ id ]
        }, timeout);
    }

    async list(typeName, query, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: "list",
            typeName: typeName,
            params: [ query ]
        }, timeout);
    }

    async create(typeName, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: "create",
            typeName: typeName,
            params: data ? [ data ] : []
        }, timeout);
    }

    async update(typeName, id, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: "update",
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, timeout);
    }

    async remove(typeName, id, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: "remove",
            typeName: typeName,
            params: [ id ]
        }, timeout);
    }

    async call(name, typeName, id, data, timeout = DEFAULT_TIMEOUT_MS) {
        return this._request({
            method: name,
            typeName: typeName,
            params: data ? [ id, data ] : [ id ]
        }, timeout);
    }
}

module.exports = MbClient;
