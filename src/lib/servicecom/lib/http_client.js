"use strict";

const url = require("url");
const rp = require("request-promise");
const ProviderClient = require("providerclient");

class HttpClient extends ProviderClient {
    constructor(...args) {
        super(...args);

        return new Proxy(this, {
            get: (target, property) => {
                if (Reflect.has(target, property)) {
                    return Reflect.get(target, property);
                }

                return this.call.bind(this, property);
            }
        });
    }

    static get typeName() {
        return "HTTP";
    }

    async _wrappedRp(opts) {
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
            uri: url.resolve(this.config.url, `/${typeName}/${id}`)
        });
    }

    async list(typeName, query) {
        return rp({
            json: true,
            method: "GET",
            uri: url.resolve(this.config.url, `/${typeName}`),
            qs: query
        });
    }

    async create(typeName, data) {
        return this._wrappedRp({
            json: true,
            method: "POST",
            uri: url.resolve(this.config.url, `/${typeName}`),
            body: data
        });
    }

    async update(typeName, id, data) {
        return this._wrappedRp({
            json: true,
            method: "PATCH",
            uri: url.resolve(this.config.url, `/${typeName}/${id}`),
            body: data
        });
    }

    async remove(typeName, id) {
        return this._wrappedRp({
            json: true,
            method: "DELETE",
            uri: url.resolve(this.config.url, `/${typeName}/${id}`)
        });
    }

    async call(name, typeName, id, data) {
        return this._wrappedRp({
            json: true,
            method: data ? "POST" : "GET",
            uri: url.resolve(this.config.url, `/${typeName}/${id}/${name}`),
            body: data
        });
    }
}

module.exports = HttpClient;
