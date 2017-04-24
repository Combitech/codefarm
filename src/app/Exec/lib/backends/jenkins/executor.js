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

        if (data) {
            this.set(data);
        }
    }

    async _onJobStarted(event) {
        if (event.queuenr === this.queuenr) {
            this.logId = await this.allocateLog("interactive", [ "stdout", "stderr" ]);
            this.started = true;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.started`, this);
        }
    }

    async _onJobCompleted(event) {
        if (event.queuenr === this.queuenr) {
            await this._logln(`Job completed with result: ${event.status}`);
            this.finished = true;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.finished`, this, event.status);
            await this.remove();
        }
    }

    async _onConsoleText(event) {
        if (event.queuenr === this.queuenr) {
            const time = moment().utc().format();
            await this._log(event.response.body, LEVEL.STDOUT, "exe", time);
        }
    }

    async start(job) {
        await this._logln(`Starting/Queueing execution of ${this.jobName} on Jenkins`);
        try {
            this.logId = await this.allocateLog("interactive", [ "stdout", "stderr" ]);

            const jenkinsBackend = BackendProxy.instance.getBackend(this.backend);
            jenkinsBackend.addListener("job_started", this._onJobStarted.bind(this));
            jenkinsBackend.addListener("job_completed", this._onJobCompleted.bind(this));
            jenkinsBackend.addListener("job_consoletext", this._onConsoleText.bind(this));
            this.queuenr = await jenkinsBackend.startJob(this, job);
        } catch (error) {
            await this._logln("Error while trying to start execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);
            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.remove();
            throw error;
        }
    }

    async resume() {
        try {
            if (this.finished) {
                await this.remove();
            }

            const job = await Job.findOne({ _id: this.jobId });
            await this.start(job);
        } catch (error) {
            await this._logln("Error while trying to resume execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);

            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.remove();
            throw error;
        }
    }

    async detach(reason) {
        throw new Error("detach not implemented", reason);
    }

    async abort() {
        throw new Error("abort not implemented");
    }

    async downloadFileAsStream(remotePath) {
        throw new Error("downloadFileAsStream not implemented", remotePath);
    }

    // TODO: Better function naming, notifyEvent is already taken by base-class Type
    async notifyInfo(event, contextId = false, obj = null) {
        if (!this.__com) {
            return;
        }

        await this._logln(`Notify event ${event} in context ${contextId}: ${JSON.stringify(obj)}`);
        await this.__com.sendCommand(`notify_${event}`, obj, contextId);
    }

    async notifyError(contextId = false, obj = null) {
        if (!this.__com) {
            return;
        }

        await this._logln(`Notify error in context ${contextId}: ${JSON.stringify(obj)}`);
        await this.__com.sendCommand("notify_error", obj, contextId);
    }
}

module.exports = JenkinsExecutor;
