"use strict";

const url = require("url");
const path = require("path");
const moment = require("moment");
// const fs = require("fs-extra-promise");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { Type, notification } = require("typelib");
const { RawLogClient } = require("loglib");
// const { SshClient } = require("ssh");
// const { SlaveCom } = require("../slavecom");
const { ObjSerialize } = require("misc");
const Job = require("./job");
const BackendProxy = require("../backend_proxy");

const LEVEL = {
    INFO: "info",
    ERROR: "error",
    STDOUT: "stdout",
    STDERR: "stderr",
    WARNING: "warn"
};

const DETACH_REASON = {
    FAILED_TO_START: "failed_to_start",
    FAILED_TO_REATTACH: "failed_to_reattach",
    FAILED_TO_ATTACH: "failed_to_attach",
    FINISHED_WITH_ERROR: "finished_with_error",
    FINISHED_WITH_SUCCESS: "finished_with_success"
};

const PATH_TYPE = {
    WIN32: "WIN32",
    POSIX: "POSIX"
};

const getPathType = (pathStr) => {
    // Check if path seems to be windows-style; [ "c:\", "/c:/", "c:/" ]
    if (pathStr.match(/^\/?\w\:[\\\/]/)) {
        return PATH_TYPE.WIN32;
    }

    return PATH_TYPE.POSIX;
};

const getPathModule = (pathStr) => {
    const pathType = getPathType(pathStr);
    if (pathType === PATH_TYPE.WIN32) {
        return path.win32;
    }

    return path.posix;
};

class Executor extends Type {
    constructor(data) {
        super();

        this.jobId = false;
        this.slaveId = false;

        this.port = 0;
        this.privateKeyPath = false;
        this.uri = false;
        this.logId = false;
        this.workspace = false;
        this.started = false;
        this.finished = false;
        this.executing = false;

        if (data) {
            delete data.ssh;
            delete data.com;

            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "executor";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    async _logln(str, level = LEVEL.INFO, tag = "sys") {
        const time = moment().utc().format();
        await this._log(`${str}\n`, level, tag, time);
    }

    async _log(str, level = LEVEL.STDOUT, tag = "exe", time, lineNr = false) {
        str = str.replace(/\n$/, "");

        for (const line of str.split("\n")) {
            if (this.logId) {
                await RawLogClient.instance.append(this.logId, time, level, tag, line, lineNr);
            }

            const prefix = `${tag.toUpperCase()}:${level}`;
            ServiceMgr.instance.log("info", `Executor[${this._id}]: Slave[${this.slaveId}]: Job[${this.jobId}]: [${prefix}] ${line}`);
        }
    }

    get _defaultTags() {
        return [ `slaveId:${this.slaveId}`, `jobName:${this.jobName}`, `jobId:${this.jobId}` ];
    }

    async allocateLog(nameTag = "", tags = []) {
        await this._logln("Allocating log file");
        const obj = await this.createType("logrepo.log", {
            name: `${this.jobName}-${nameTag}`,
            tags: tags
        });

        return obj._id;
    }

    async createType(type, data, addJobTags = true) {
        const [ serviceName, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceName);

        await this._logln(`Creating type ${typeName} @ ${serviceName}`);

        if (addJobTags) {
            data.tags = data.tags || [];
            data.tags = data.tags.concat(this._defaultTags);
        }

        return await client.create(typeName, data);
    }

    async updateType(type, id, data) {
        const [ serviceName, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceName);

        await this._logln(`Updating type ${typeName} @ ${serviceName}`);

        return await client.update(typeName, id, data);
    }

    async typeAction(type, id, action, data) {
        const [ serviceName, typeName ] = type.split(".");
        const client = ServiceComBus.instance.getClient(serviceName);

        await this._logln(`Type action ${typeName} @ ${serviceName}`);

        return await client[action](typeName, id, data);
    }

    _convToEnvObj(obj, typeName = false, maxDepth = 1) {
        const removeComplexValues = (obj) => {
            const out = {};
            for (const [ k, v ] of Object.entries(obj)) {
                if (typeof v !== "object" &&
                    typeof v !== "function" &&
                    !(v instanceof Array)) {
                    out[k] = v;
                }
            }

            return out;
        };
        const typeNamePrefix = typeName ? `_${typeName.toUpperCase()}` : "";
        const env = removeComplexValues(ObjSerialize.flatten(obj, {
            prefix: `CF${typeNamePrefix}`,
            keyFormatter: ObjSerialize.keyFormatters.addPrefixConvUpperCase,
            annotateArrays: true,
            maxDepth: maxDepth
        }));

        return env;
    }

    // TODO: move this to job type?
    getJobInfo(job) {
        return {
            version: "0.0.1",
            job: {
                id: job._id,
                name: job.name,
                baseline: {
                    id: job.baseline._id,
                    name: job.baseline.name,
                    content: job.baseline.content
                }
            }
        };
    }

    getEnv(jobInfo) {
        return this._convToEnvObj(jobInfo, false, 6);
    }

    async allocate(job, slave) {
        this.jobId = job._id;
        this.jobName = job.name;
        this.slaveId = slave._id;
        this.backend = slave.backend;

        await this._logln(`Allocating executor on slave ${this.slaveId} for job ${this.jobId}`);

        const { pathname } = url.parse(slave.uri);
        const workspaceName = job.workspaceName || `job-${this.jobName.replace(/ /g, "_")}-${this.jobId}`;
        this.uri = slave.uri;
        this.workspace = path.join(pathname, `slave-${this.slaveId}`, workspaceName);
        if (getPathType(this.workspace) === PATH_TYPE.WIN32) {
            // Remove leading / for windows slaves
            this.workspace = this.workspace.replace(/^\//, "");
        }
        this.privateKeyPath = slave.privateKeyPath;

        try {
            await notification.emit(`${this.constructor.typeName}.allocated`, this);
            await this.save();
        } catch (error) {
            await this._logln("Error while allocating executor", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);
            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.remove();

            throw error;
        }
    }

    async start(job) {
        await this._logln(`Starting execution of ${this.jobName}`);
        try {
            this.logId = await this.allocateLog("interactive", [ "stdout", "stderr" ]);
            await notification.emit(`${this.constructor.typeName}.started`, this);
            this.started = true;
            this.workspaceCleanup = job.workspaceCleanup;
            await this.save();

            await BackendProxy.instance.startJob(this.backend, job, this);
        } catch (error) {
            await this._logln("Error while trying to start execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);
            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.detach(DETACH_REASON.FAILED_TO_START);
            await this.remove();

            throw error;
        }
    }

    async resume() {
        try {
            if (this.finished) {
                await this.remove();
            } else if (!this.started) {
                const job = await Job.findOne({ _id: this.jobId });
                await this.start(job);
            } else {
                await this._attach();

                if (!this.executing) {
                    const job = await Job.findOne({ _id: this.jobId });
                    await this._uploadScript(job.script);
                    await this._executeScript(this.getJobInfo(job));
                }
            }
        } catch (error) {
            await this._logln("Error while trying to resume execution", LEVEL.ERROR);
            await this._logln(error, LEVEL.ERROR);

            await notification.emit(`${this.constructor.typeName}.failure`, this);
            await this.detach(DETACH_REASON.FAILED_TO_REATTACH);
            await this.remove();

            throw error;
        }
    }

    async detach(reason) {
        await BackendProxy.instance.detach(this.backend, this, reason);
    }

    async abort() {
        if (!this.__com) {
            return;
        }
        await this._logln("Abort requested");
        this.finished = true;
        await this.save();
        this.__com.sendCommand("abort"); // TODO: Await abort
        notification.emit(`${this.constructor.typeName}.finished`, this, "aborted");
        await this.detach(DETACH_REASON.FINISHED_WITH_ERROR);
        await this.remove();
    }

    async downloadFileAsStream(remotePath) {
        const pathModule = getPathModule(remotePath);
        const remoteAbsPath = pathModule.isAbsolute(remotePath) ? remotePath : path.join(this.workspace, remotePath);

        await this._logln(`Downloading file, ${remoteAbsPath}`);
        const fileStream = this.__ssh.getRemoteReadStream(remoteAbsPath);

        return fileStream;
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

module.exports = Executor;
