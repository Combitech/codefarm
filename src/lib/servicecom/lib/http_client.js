"use strict";

const url = require("url");
const rp = require("request-promise");
const ProviderClient = require("providerclient");

class HttpClient extends ProviderClient {
    constructor(...args) {
        super(...args);

        if (this.config.testMode && !this.config.uri) {
            this.config.uri = "http://nowhere";
        }

        return new Proxy(this, {
            get: (target, property) => {
                if (property === "then") {
                    // Special case when the object is
                    // wrapped in a Promise.resolve and
                    // tested if it is a promise by seeing
                    // if then exists.
                    return false;
                } else if (Reflect.has(target, property)) {
                    return Reflect.get(target, property);
                }

                return this.call.bind(this, property);
            }
        });
    }

    static get typeName() {
        return "REST";
    }

    get url() {
        return this.config.uri;
    }

    async _wrappedRp(opts) {
        if (this.config.testResponder) {
            return this.config.testResponder(opts);
        } else if (this.config.testMode) {
            return Promise.resolve("");
        }

        try {
            const result = await rp(opts);

            if (typeof result === "object") {
                if (result.result !== "success") {
                    const error = new Error(result.error);
                    error.status = error.status;

                    throw error;
                }

                return result.data;
            }

            return result;
        } catch (e) {
            const error = new Error(e.error.error);
            error.status = e.statusCode;

            throw error;
        }
    }

    async get(typeName, id) {
        return this._wrappedRp({
            json: true,
            method: "GET",
            uri: url.resolve(this.config.uri, `/${typeName}/${id}`)
        });
    }

    async list(typeName, query) {
        return rp({
            json: true,
            method: "GET",
            uri: url.resolve(this.config.uri, `/${typeName}`),
            qs: query
        });
    }

    async create(typeName, data) {
        return this._wrappedRp({
            json: true,
            method: "POST",
            uri: url.resolve(this.config.uri, `/${typeName}`),
            body: data
        });
    }

    async update(typeName, id, data) {
        return this._wrappedRp({
            json: true,
            method: "PATCH",
            uri: url.resolve(this.config.uri, `/${typeName}/${id}`),
            body: data
        });
    }

    async remove(typeName, id) {
        return this._wrappedRp({
            json: true,
            method: "DELETE",
            uri: url.resolve(this.config.uri, `/${typeName}/${id}`)
        });
    }

    async call(name, typeName, id, data) {
        return this._wrappedRp({
            json: true,
            method: data ? "POST" : "GET",
            uri: url.resolve(this.config.uri, `/${typeName}/${id}/${name}`),
            body: data
        });
    }
}

module.exports = HttpClient;
