"use strict";

const url = require("url");
const rp = require("request-promise");
const ProviderClient = require("providerclient");

class RestClient extends ProviderClient {
    constructor(config) {
        super(config);

        if (this.config.testMode && !this.config.uri) {
            this.config.uri = "http://nowhere";
        }
    }

    static get typeName() {
        return "REST";
    }

    /**
     * Perform HTTP get and parse response according to contentType
     * @param {String} path HREF path added to the end of baseUrl
     *   setup in init()
     * @param {Object} [params] Query string parameters
     * @return {Object|String} HTTP get response
     */
    async get(path, params = {}) {
        const opts = {
            uri: url.resolve(this.config.uri, path),
            qs: params,
            json: true
        };

        if (!this.config.testModeUseRest) {
            if (this.config.testResponder) {
                return this.config.testResponder(opts);
            } else if (this.config.testMode) {
                return Promise.resolve("");
            }
        }

        return rp(opts);
    }

    /**
     * Perform HTTP post
     * @param {String} path HREF path added to the end of baseUrl
     *   setup in init()
     * @param {Object} data Data to post
     * @param {Object} [params] Query string parameters
     * @return {Object} HTTP response
     */
    async post(path, data, params = {}) {
        const opts = {
            method: "POST",
            uri: url.resolve(this.config.uri, path),
            body: data,
            qs: params,
            json: true
        };

        if (this.config.testMode && !this.config.testModeUseRest) {
            if (this.config.testResponder) {
                return this.config.testResponder(opts);
            }

            return Promise.resolve("");
        }

        return rp(opts);
    }

    /**
     * Perform HTTP post
     * @param {String} path HREF path added to the end of baseUrl
     *   setup in init()
     * @param {Object} data Data to post
     * @param {Object} [params] Query string parameters
     * @return {Object} HTTP response
     */
    async postMultipart(path, data, params = {}) {
        const opts = {
            method: "POST",
            uri: url.resolve(this.config.uri, path),
            formData: data,
            qs: params,
            json: true
        };

        if (this.config.testMode && !this.config.testModeUseRest) {
            if (this.config.testResponder) {
                return this.config.testResponder(opts);
            }

            return Promise.resolve("");
        }

        return rp(opts);
    }

    /**
     * Perform HTTP patch
     * @param {String} path HREF path added to the end of baseUrl
     *   setup in init()
     * @param {Object} data Data to patch
     * @param {Object} [params] Query string parameters
     * @return {Object} HTTP response
     */
    async patch(path, data, params = {}) {
        const opts = {
            method: "PATCH",
            uri: url.resolve(this.config.uri, path),
            body: data,
            qs: params,
            json: true
        };

        if (this.config.testMode && !this.config.testModeUseRest) {
            if (this.config.testResponder) {
                return this.config.testResponder(opts);
            }

            return Promise.resolve("");
        }

        return rp(opts);
    }

    /**
     * Perform HTTP delete
     * @param {String} path HREF path added to the end of baseUrl
     *   setup in init()
     * @param {Object} data Data to post
     * @param {Object} [params] Query string parameters
     * @return {Object} HTTP response
     */
    async remove(path, data, params = {}) {
        const opts = {
            method: "DELETE",
            uri: url.resolve(this.config.uri, path),
            body: data,
            qs: params,
            json: true
        };

        if (this.config.testMode && !this.config.testModeUseRest) {
            if (this.config.testResponder) {
                return this.config.testResponder(opts);
            }

            return Promise.resolve("");
        }

        return rp(opts);
    }
}

module.exports = RestClient;
