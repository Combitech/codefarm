"use strict";

const Job = require("../../types/job");
const { notification } = require("typelib");
const BackendProxy = require("../../backend_proxy");
const Executor = require("../../types/executor");
const moment = require("moment");

const LEVEL = {
    INFO: "info",
    ERROR: "error",
    STDOUT: "stdout",
    STDERR: "stderr",
    WARNING: "warn"
};

class JenkinsExecutor extends Executor {
    constructor(data) {
        super();

        this.host = false;
        this.queuenr = false;
        this.consoleOffset = 0;

        if (data) {
            this.set(data);
        }
    }

    async _onJobStarted(event) {
        if (event.queuenr === this.queuenr) {
            this.logId = await this.allocateLog("interactive", [ "stdout", "stderr" ]);
            this.started = true;
            this.jenkinsJobUrl = event.jenkinsurl;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.started`, this);
        }
    }

    // NOTE: We wait for the console log to end before getting the job result
    // This is to simplify resuming, avoiding race conditions when resuming
    // and making sure the complete log is downloaded before removing ourselves
    async _onConsoleText(event) {
        if (event.queuenr === this.queuenr) {
            const time = moment().utc().format();
            await this._log(event.response.body, LEVEL.STDOUT, "exe", time);
            // Save offset for if something goes wrong and we need to resume
            this.consoleOffset = parseInt(event.response.headers["x-text-size"], 10);
            await this.save();

            // If the log is at an end, resolve job status
            if (!event.response.headers["x-more-data"]) {
                await this._logln("Jenkins console log ended, resolving finished job status");
                await this._resolveFinishedStatus();
            }
        }
    }

    async _resolveFinishedStatus() {
        const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);
        const status = await jenkinsBackend.getJobStatus(this.jenkinsJobUrl);
        if (status === "ongoing") {
            await this._logln("Error while trying to resolve finished Jenkins job status", LEVEL.ERROR);
            await this._logln(`Did not expect status ${status}`, LEVEL.ERROR);
            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.remove();
        } else {
            this.finished = true;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.finished`, this, status);
            await this.detach(`finished_with_${status}`);
            await this.remove();
        }
    }

    async start(job) {
        await this._logln(`Starting/Queueing execution of ${this.jobName} on Jenkins`);
        try {
            this.logId = await this.allocateLog("interactive", [ "stdout", "stderr" ]);

            const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);
            if (!this._onJobStartedHandler) {
                this._onJobStartedHandler = this._onJobStarted.bind(this);
                jenkinsBackend.addListener("job_started", this._onJobStartedHandler);
            }
            if (!this._onConsoleTextHandler) {
                this._onConsoleTextHandler = this._onConsoleText.bind(this);
                jenkinsBackend.addListener("job_consoletext", this._onConsoleTextHandler);
            }
            this.queuenr = await jenkinsBackend.startJob(job);
        } catch (error) {
            await this._logln("Error while trying to start execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);
            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.detach("failed_to_start");
            await this.remove();
            throw error;
        }
    }

    async resume() {
        try {
            if (this.finished) {
                await this.remove();
            }

            const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);

            if (this.started) {
                await this._logln(`Job resumed as started, requesting log from offset: ${this.consoleOffset}`);
                if (!this._onConsoleTextHandler) {
                    this._onConsoleTextHandler = this._onConsoleText.bind(this);
                    jenkinsBackend.addListener("job_consoletext", this._onConsoleTextHandler);
                }
                await jenkinsBackend.getConsoleText(this.queuenr, this.jenkinsJobUrl, this.consoleOffset);
            } else if (this.queuenr) {
                await this._logln("Job resumed with queue number, listening for start");
                if (!this._onJobStartedHandler) {
                    this._onJobStartedHandler = this._onJobStarted.bind(this);
                    jenkinsBackend.addListener("job_started", this._onJobStartedHandler);
                }
                if (!this._onConsoleTextHandler) {
                    this._onConsoleTextHandler = this._onConsoleText.bind(this);
                    jenkinsBackend.addListener("job_consoletext", this._onConsoleTextHandler);
                }
            } else {
                await this._logln("Job resumed without queue number, rerunning");
                const job = await Job.findOne({ _id: this.jobId });
                await this.start(job);
            }
        } catch (error) {
            await this._logln("Error while trying to resume execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);

            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.remove();
            throw error;
        }
    }

    async detach(reason) {
        const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);
        if (this._onJobStartedHandler) {
            jenkinsBackend.removeListener("job_started", this._onJobStartedHandler);
            delete this._onJobStartedHandler;
        }
        if (this._onConsoleTextHandler) {
            jenkinsBackend.removeListener("job_consoletext", this._onConsoleTextHandler);
            delete this._onConsoleTextHandler;
        }
        await this._logln(`Detached, reason: ${reason}`);
    }

    async abort() {
        await this._logln("Abort requested");

        const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);

        if (this.started) {
            await jenkinsBackend.stopJob(this.jenkinsJobUrl);
        } else {
            await jenkinsBackend.dequeueUrl(this.queuenr);
        }

        this.finished = true;
        await this.save();
        notification.emit(`${this.constructor.typeName}.finished`, this, "aborted");
        await this.detach("aborted");
        await this.remove();
    }

    async downloadFileAsStream(remotePath) {
        throw new Error("downloadFileAsStream not implemented", remotePath);
    }
}

module.exports = JenkinsExecutor;
