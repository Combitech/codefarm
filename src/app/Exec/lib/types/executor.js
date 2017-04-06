"use strict";

const url = require("url");
const path = require("path");
const moment = require("moment");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { Type, notification } = require("typelib");
const { RawLogClient } = require("loglib");
const BackendProxy = require("../backend_proxy");

const LEVEL = {
    INFO: "info",
    ERROR: "error",
    STDOUT: "stdout",
    STDERR: "stderr",
    WARNING: "warn"
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

// This class is a base abstract class
class Executor extends Type {
    constructor(data) {
        super();

        this.jobId = false;
        this.slaveId = false;
        this.backendId = false;

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

    static construct(data) {
        return BackendProxy.instance.createExecutor(data.backendId, data);
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

    async allocate(job, slave) {
        this.jobId = job._id;
        this.jobName = job.name;
        this.slaveId = slave._id;
        this.backendId = slave.backend;

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
}

module.exports = Executor;
