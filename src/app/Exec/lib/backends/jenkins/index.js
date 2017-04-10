"use strict";

const { AsyncEventEmitter } = require("emitter");
const { ServiceMgr } = require("service");
const rp = require("request-promise");

class JenkinsBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.crumb = false;
        this.locks = {};
    }

    async start() {
        ServiceMgr.instance.log("verbose", `Retrieving crumb for ${this.backend.authUser} on ${this.backend.hostUrl}`);
        const url = `${this.backend.hostUrl}/crumbIssuer/api/json`;

        try {
            const response = await this._sendRequest(url);
            // TODO: What if crumb expires?
            this.crumb = response.crumb;
            ServiceMgr.instance.log("verbose", "Crumb retrieved");
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to retrieve crumb: ${err}`);
        }
    }

    async dispose() {
    }

    async _sendRequest(uri, body = null, method = "GET") {
        const token = this.crumb || this.backend.authToken; // Token is used first time to retrieve crumb
        const auth = Buffer.from(`${this.backend.authUser}:${token}`).toString("base64");
        const options = {
            method: method,
            uri: uri,
            headers: {
                "User-Agent": "Code Farm",
                "Authorization": `Basic ${auth}`
            },
            body: body,
            json: true // Automatically stringifies the body to JSON
        };

        return rp(options);
    }

    async startJob(jobName) {

    }

    get backendType() {
        return this.backend.backendType;
    }
}

module.exports = JenkinsBackend;
