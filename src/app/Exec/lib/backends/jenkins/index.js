"use strict";

const { AsyncEventEmitter } = require("emitter");
const { ServiceMgr } = require("service");
const rp = require("request-promise");
const JenkinsEventEmitter = require("./jenkins_event_emitter");
const Job = require("../../types/job");

/*
To get started with Jenkins integration:
1. Create a new functional user, make sure they have authority to start jobs
2. Make sure the Notification plugin is installed
    https://wiki.jenkins-ci.org/display/JENKINS/Notification+Plugin
3. Edit the jobs you wish to run via jenkins to send notifications
   You will need to fill in the url and port to the jenkins backend you create

Creating a new Jenkins backend:

Example configuration:
    host -> "http://myjenkins.mycompany.com"

    The above will ...
*/

// Translation table Jenkins job codes => Codefarm job codes
const RESULTCODES = {
    "SUCCESS": "success",
    "FAILURE": "fail",
    "ABORTED": "aborted",
    "BUILDING": "ongoing"
};

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

        // Start event monitoring towards jenkins and towards console text events
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
            this.addListener("consoleText", this._onJobConsoleText.bind(this));
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup Jenkins notification server: ${err}`);
        }
    }

    _createRequest(uri, method = "POST", body = null) {
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
            json: true // Automatically stringifies the body to JSON
        };

        return options;
    }

    async _sendRequest(uri, method = "POST", body = null, fullResponse = true) {
        const options = this._createRequest(uri, method, body);
        options.resolveWithFullResponse = fullResponse;

        return rp(options);
    }

    // Get the console text log for a building job as a stream
    async getConsoleText(queuenr, jobUrl, offset) {
        const url = `${jobUrl}logText/progressiveText?start=${offset}`;
        const response = await this._sendRequest(url, "GET");
        this.emit("consoleText", { queuenr, jobUrl, offset, response });
    }

    // Start/Queue job
    async startJob(job) {
        const jenkinsJobName = job.script;
        // TODO: Send parameters in form
        const url = `${this.backend.hostUrl}/job/${jenkinsJobName}/build`;
        const response = await this._sendRequest(url);
        // Parse response to get queuenr from header
        const parts = response.headers.location.split("/");

        return parts[parts.length - 2];
    }

    async stopJob(url) {
        const stopUrl = `${url}stop`;

        return await this._sendRequest(stopUrl, "POST", null, false);
    }

    async dequeueJob(queuenr) {
        const dequeueUrl = `${this.backend.hostUrl}/queue/cancelItem?id=${queuenr}`

        return await this._sendRequest(dequeueUrl, "POST", null, false)
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

    async getJobStatus(url) {
        const jsonUrl = `${url}api/json`;
        const response = await this._sendRequest(jsonUrl, "GET", null, false);
        if (response.building) {
            return RESULTCODES.BUILDING;
        }

        return RESULTCODES[response.result];
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
        const outevent = this._createEvent(event);
        await this.emit("job_started", outevent);

        // Start polling console text, this will emit consoleText event
        this.getConsoleText(outevent.queuenr, outevent.jenkinsurl, 0);
    }

    async _onJobCompleted(event) {
        ServiceMgr.instance.log("verbose", "job_completed event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        await this.emit("job_completed", this._createEvent(event));
    }

    async _onJobFinalized(event) {
        ServiceMgr.instance.log("verbose", "job_finalized event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        await this.emit("job_finalized", this._createEvent(event));
    }

    async _onJobConsoleText(event) {
        ServiceMgr.instance.log("verbose", "console text event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        await this.emit("job_consoletext", event);

        // If more data indicated: poll after interval
        if (event.response.headers["x-more-data"]) {
            const offset = parseInt(event.response.headers["x-text-size"], 10);
            setTimeout(() => {
                ServiceMgr.instance.log("debug", `Polling jenkins console (interval: ${this.backend.pollDelay})`);
                this.getConsoleText(event.queuenr, event.jobUrl, offset);
            }, this.backend.pollDelay);
        }
    }

    async _startMonitorEventStream() {
        this.jenkinsEmitter.addListener("job_started", this._onJobStarted.bind(this));
        this.jenkinsEmitter.addListener("job_completed", this._onJobCompleted.bind(this));

        return await this.jenkinsEmitter.start(this.backend.port);
    }

    get backendType() {
        return this.backend.backendType;
    }

    get jenkinsUrl() {
        return this.backend.hostUrl;
    }

    async dispose() {
        this.removeAllListeners();
        this.jenkinsEmitter.removeAllListeners();
        await this.jenkinsEmitter.dispose();
    }
}

module.exports = JenkinsBackend;
