"use strict";

const { AsyncEventEmitter } = require("emitter");
const { ServiceMgr } = require("service");
const rp = require("request-promise");
const JenkinsEventEmitter = require("./jenkins_event_emitter");
const Job = require("../../types/job");

/*
To get started with Jenkins integration:
1. Create a new functional user, make sure they have authority to start jobs

Creating a new Jenkins backend:

Example configuration:
    host -> "http://myjenkins.mycompany.com"

    The above will ...
*/


class JenkinsBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.crumb = false;
        this.crumbRequestField = false;
        this.locks = {};
        this.jenkinsEmitter = new JenkinsEventEmitter(
            ServiceMgr.instance.log.bind(ServiceMgr.instance)
        );
    }

    async start() {
        ServiceMgr.instance.log("verbose", `Retrieving crumb for ${this.backend.authUser} on ${this.backend.hostUrl}`);
        const url = `${this.backend.hostUrl}/crumbIssuer/api/json`;

        try {
            const response = await this._sendRequest(url, "GET", null, false);
            // TODO: What if crumb expires?
            this.crumb = response.crumb;
            this.crumbRequestField = response.crumbRequestField;
            ServiceMgr.instance.log("verbose", "Crumb retrieved");
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to retrieve crumb: ${err}`);
        }

        // Start event monitoring towards jenkins
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup Jenkins notification server: ${err}`);
        }
    }

    async _sendRequest(uri, method = "POST", body = null, fullResponse = true) {
        const auth = Buffer.from(`${this.backend.authUser}:${this.backend.authToken}`).toString("base64");
        const headers = {
            "User-Agent": "Code Farm",
            "Authorization": `Basic ${auth}`
        };

        // Use crumb if available (retrieved on start)
        if (this.crumb) {
            headers[this.crumbRequestField] = this.crumb;
        }

        const options = {
            method,
            uri,
            headers,
            body,
            json: true, // Automatically stringifies the body to JSON
            resolveWithFullResponse: fullResponse
        };

        return rp(options);
    }

    // Start/Queue job
    async startJob(executor, job) {
        const jenkinsJobName = job.script;
        // TODO: Send parameters in form
        const url = `${this.backend.hostUrl}/job/${jenkinsJobName}/build`;
        const response = await this._sendRequest(url);
        // Parse response to get queuenr from header
        const parts = response.headers.location.split("/");

        return parts[parts.length - 2];
    }

    async verifySlaveJob(slave) {
        return new Job({
            name: `Verify_slave_${slave._id}`,
            // All slaves have their ID as a tag... This will match a specific slave
            criteria: `${slave._id}`,
            requeueOnFailure: false,
            script: "testJob",
            baseline: false
        });
    }

    _createEvent(event) {
        const obj = {
            jenkinsname: event.name,
            jenkinsurl: `${this.backend.hostUrl}/${event.build.url}`,
            queuenr: event.build.queue_id.toString(),
            status: event.build.status ? event.build.status.toLowerCase() : "unknown"
        };

        ServiceMgr.instance.log("debug", JSON.stringify(obj, null, 2));

        return obj;
    }

    async _onJobStarted(event) {
        ServiceMgr.instance.log("verbose", "job_started event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        this.emit("job_started", this._createEvent(event));
    }

    async _onJobCompleted(event) {
        ServiceMgr.instance.log("verbose", "job_completed event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        this.emit("job_completed", this._createEvent(event));
    }

    async _onJobFinalized(event) {
        ServiceMgr.instance.log("verbose", "job_finalized event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        this.emit("job_finalized", this._createEvent(event));
    }

    async _startMonitorEventStream() {
        this.jenkinsEmitter.addListener("job_started", this._onJobStarted.bind(this));
        this.jenkinsEmitter.addListener("job_completed", this._onJobCompleted.bind(this));

        return await this.jenkinsEmitter.start(this.backend.port);
    }

    get backendType() {
        return this.backend.backendType;
    }

    async dispose() {
        this.removeAllListeners();
        this.jenkinsEmitter.removeAllListeners();
        await this.jenkinsEmitter.dispose();
    }
}

module.exports = JenkinsBackend;
