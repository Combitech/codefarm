"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const { notification } = require("typelib");

const CLEANUP_POLICY = { // Keep in sync with same list in FlowCtrl step
    KEEP: "keep",
    REMOVE_ON_FINISH: "remove_on_finish",
    REMOVE_ON_SUCCESS: "remove_on_success",
    REMOVE_WHEN_NEEDED: "remove_when_needed"
};

const STATUS = {
    QUEUED: "queued",
    ALLOCATED: "allocated",
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

const ongoingStatusList = [ STATUS.ONGOING, STATUS.QUEUED, STATUS.ALLOCATED ];

class Job extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.criteria = "";
        this.script = false;
        this.workspaceName = false;
        this.workspaceCleanup = CLEANUP_POLICY.KEEP;
        this.jobSpec = false;
        
        this.baseline = false;
        this.requeueOnFailure = true;

        this.started = false;
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
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "job";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    async _saveHook(olddata) {
        if (ongoingStatusList.includes(this.status)) {
            // Not finished
            this.finished = false;
        } else if (olddata && !olddata.finished) {
            // Update of not ongoing, not finished sub-job, set finished
            this.finished = new Date();
        } else if (!olddata) {
            // Create of not ongoing sub-job, set finished
            this.finished = new Date();
        }

        if (this.lastRunId !== false) {
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
            // baseline can be false or object
            if (data.baseline !== false) {
                assertType(data.baseline, "data.baseline", "object");
                assertProp(data.baseline, "_id", true);
                assertProp(data.baseline, "name", true);
                assertProp(data.baseline, "content", true);
                assertType(data.baseline.content, "data.baseline.content", "object");
            }
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
                subJobs: [],
                createdRefs: [] // FlowCtrl uses this to connect items
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

        this.currentRun.createdRefs.push({
            _ref: true,
            type: "artifactrepo.artifact",
            id: artifactId,
            name: artifactName
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

        this.currentRun.createdRefs.push({
            _ref: true,
            type: "coderepo.revision",
            id: revisionId,
            name: "revision"
        });

        await this.save();
    }

    async setAllocated(slaveId) {
        this.slaveId = slaveId;
        this.status = STATUS.ALLOCATED;
        await this.save();
    }

    async setOngoing(stdOutLogId) {
        if (this.lastRunId === false) {
            this.lastRunId = 0;
        } else {
            this.lastRunId++;
        }

        this.status = STATUS.ONGOING;
        this.started = new Date();

        await this.addLog("stdout", stdOutLogId, false);
        await this.save();
    }

    /** Reset and requeue job. Typical use-case is upon environment failures.
     * @return {undefined}
     */
    async setReset() {
        if (ongoingStatusList.includes(this.status)) {
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
        if (this.lastRunId !== false) {
            this.currentRun.status = result;
        }
        await this.save();
    }

    async abort() {
        // Job status will be set when executor is aborted
        return notification.emit(`${this.constructor.typeName}.aborted`, this);
    }
}

Job.CLEANUP_POLICY = CLEANUP_POLICY;
Job.STATUS = STATUS;

module.exports = Job;
