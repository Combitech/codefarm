"use strict";

const { serviceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const { notification } = require("typelib");

const STATUS = {
    QUEUED: "queued",
    ONGOING: "ongoing",
    SUCCESS: "success",
    ABORTED: "aborted",
    FAIL: "fail",
    SKIP: "skip"
};

const REVISION_STATE = {
    MERGED: "merged"
};

const values = (obj) => Object.keys(obj).map((key) => obj[key]);

const notFinishedStatusList = [ STATUS.ONGOING, STATUS.QUEUED ];

class Job extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.criteria = "";
        this.executeOnSlaveId = false;
        this.script = false;
        this.baseline = false;
        this.requeueOnFailure = true;

        this.slaveId = false;
        this.finished = false;
        this.status = STATUS.QUEUED;
        // Incremented in setOngoing. If job fails due to environment failure
        // setOngoing might be called multiple times with setReset in between.
        this.lastRunId = false;
        this.runs = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "job";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    async _saveHook(olddata) {
        if (notFinishedStatusList.indexOf(this.status) === -1) {
            // Finished
            if (olddata && !olddata.finished) {
                // Update of not ongoing, not finished sub-job, set finished
                this.finished = new Date();
            } else if (!olddata) {
                // Create of not ongoing sub-job, set finished
                this.finished = new Date();
            }
        } else {
            // Not finished
            this.finished = false;
        }

        if (this.status !== STATUS.QUEUED) {
            this.currentRun.finished = this.finished;
            this.currentRun.status = this.status;
            this.currentRun.slaveId = this.slaveId;
        }
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        assertProp(data, "status", false);
        assertProp(data, "slaveId", false);
        assertProp(data, "finished", false);
        assertProp(data, "runs", false);
        assertProp(data, "lastRunId", false);
        assertProp(data, "executeOnSlaveId", false);

        if (event === "create") {
            assertProp(data, "name", true);
            assertType(data.name, "data.name", "string");
            assertProp(data, "criteria", true);
            assertType(data.criteria, "data.criteria", "string");
            assertProp(data, "script", true);
            assertType(data.script, "data.script", "string");
            assertProp(data, "baseline", true);
            assertType(data.baseline, "data.baseline", "object");
            assertProp(data.baseline, "_id", true);
            assertProp(data.baseline, "name", true);
            assertProp(data.baseline, "content", true);
            assertType(data.baseline.content, "data.baseline.content", "object");
        }
    }

    get currentRun() {
        if (this.lastRunId === false) {
            throw new Error("lastRunId not initialized");
        }

        if (!this.runs[this.lastRunId]) {
            this.runs[this.lastRunId] = {
                artifacts: [],
                logs: [],
                revisions: [],
                subJobs: []
            };
        }

        return this.runs[this.lastRunId];
    }

    async addSubJob(subJobName, subJobId) {
        this.currentRun.subJobs.push({
            name: subJobName,
            id: subJobId,
            type: "exec.subjob",
            _ref: true
        });
        await this.save();
    }

    async addLog(logName, logId, save = true) {
        this.currentRun.logs.push({
            name: logName,
            id: logId,
            type: "logrepo.log",
            _ref: true
        });

        if (save) {
            await this.save();
        }
    }

    async addArtifact(artifactName, artifactRepo, artifactVersion, artifactId) {
        this.currentRun.artifacts.push({
            name: artifactName,
            id: artifactId,
            type: "artifactrepo.artifact",
            _ref: true,
            repository: artifactRepo,
            version: artifactVersion
        });
        await this.save();
    }

    async addRevision(revisionId, state) {
        if (values(REVISION_STATE).indexOf(state) === -1) {
            throw new Error(`Illegal Job revision state ${state}`);
        }
        this.currentRun.revisions.push({
            name: "revision",
            id: revisionId,
            type: "coderepo.revision",
            runId: this.lastRunId,
            _ref: true,
            state: state
        });
        await this.save();
    }

    async setOngoing(slaveId, stdOutLogId) {
        this.slaveId = slaveId;
        if (this.lastRunId === false) {
            this.lastRunId = 0;
        } else {
            this.lastRunId++;
        }
        this.status = STATUS.ONGOING;

        this.addLog("stdout", stdOutLogId, false);
        await this.save();
    }

    /** Reset and requeue job. Typical use-case is upon environment failures.
     * @return {undefined}
     */
    async setReset() {
        if (notFinishedStatusList.indexOf(this.status) !== -1) {
            this.slaveId = false;
            this.status = STATUS.QUEUED;
            await this.save();
            await notification.emit(`${this.constructor.typeName}.requeued`, this);
        }
    }

    /** Re-run job
     * @return {undefined}
     */
    async rerun() {
        this.slaveId = false;
        this.status = STATUS.QUEUED;
        await this.save();
        await notification.emit(`${this.constructor.typeName}.requeued`, this);
    }

    async setFinished(result) {
        if (values(STATUS).indexOf(result) === -1) {
            throw new Error(`Illegal Job status ${result}`);
        }
        this.status = result;
        this.currentRun.status = result;
        await this.save();
    }
}

module.exports = Job;
