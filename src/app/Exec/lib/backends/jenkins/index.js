"use strict";

const { AsyncEventEmitter } = require("emitter");
const { ServiceMgr } = require("service");
const rp = require("request-promise");
const JenkinsEventEmitter = require("./jenkins_event_emitter");

class JenkinsBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.crumb = false;
        this.locks = {};
        this.jenkinsEmitter = new JenkinsEventEmitter(
            ServiceMgr.instance.log.bind(ServiceMgr.instance)
        );
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

        // Start event monitoring towards jenkins
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup Jenkins notification server: ${err}`);
        }
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

    // Start/Queue job and send along job id as parameter
    async queueJob(job, jenkinsJobName) {
        const params = `CODEFARM_JOB_ID=${job._id}`;
        const url = `${this.backend.hostUrl}/job/${jenkinsJobName}/buildWithParameters?${params}`;

        return await this._sendRequest(url, null, "POST");
    }

    _createEvent(event) {
        const obj = {
            jenkinsname: event.name,
            jenkinsurl: `${this.backend.hostUrl}/${event.build.url}`,
            jobid: event.build.parameters.JOB_ID
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
