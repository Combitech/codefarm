"use strict";

const url = require("url");
const path = require("path");
const moment = require("moment");
const fs = require("fs-extra-promise");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { Type, notification } = require("typelib");
const { RawLogClient } = require("loglib");
const { SshClient } = require("ssh");
const { SlaveCom } = require("../slavecom");
const { ObjSerialize } = require("misc");
const Job = require("./job");

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

const ATTACH_TIMEOUT_MS = 10000;

// Windows requires .bat file extension to run as batch-file
const REMOTE_SCRIPT_FILENAME = "job.cmd";
const REMOTE_SLAVE_SCRIPT = "slave.js";

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

        this.__ssh = new SshClient();

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

    async _connect() {
        const info = url.parse(this.uri);
        const privateKey = await fs.readFileAsync(this.privateKeyPath);

        await this._logln(`Connecting to ssh, ${this.uri}`);

        await this.__ssh.connect({
            host: info.hostname,
            port: info.port || 22,
            username: info.auth || process.env.USER,
            privateKey: privateKey,
            useSftp: true
        }, async (error) => {
            await this._logln(`SSH error: ${JSON.stringify(error, null, 2)}`, LEVEL.ERROR);
        });
    }

    async _ensureWorkspace() {
        try {
            await this._logln(`Ensuring workspace, ${this.workspace}`);
            await this.__ssh.mkdir(path.dirname(this.workspace));
            await this.__ssh.mkdir(this.workspace);
        } catch (error) {
            throw new Error(`Error creating slave workspace at ${this.workspace}: ${error}`);
        }
    }

    async _removeWorkspace() {
        try {
            await this._logln(`Removing workspace, ${this.workspace}`);
            await this.__ssh.rmdir(this.workspace);
        } catch (error) {
            throw new Error(`Error removing slave workspace at ${this.workspace}: ${error}`);
        }
    }

    async _uploadSlave() {
        const files = {
            [ REMOTE_SLAVE_SCRIPT ]: {
                localPath: path.join(__dirname, "..", "..", "build", REMOTE_SLAVE_SCRIPT),
                remotePath: path.join(this.workspace, REMOTE_SLAVE_SCRIPT)
            },
            "cli.js": {
                localPath: path.join(__dirname, "..", "..", "build", "cli.js"),
                remotePath: path.join(this.workspace, "cli.js")
            }
        };

        for (const fileInfo of Object.values(files)) {
            await this._logln(`Uploading slave file, ${fileInfo.remotePath}`);
            try {
                await this.__ssh.upload(fileInfo.localPath, fileInfo.remotePath);
            } catch (error) {
                throw new Error(`Error uploading context to slave at ${fileInfo.remotePath}: ${error}`);
            }
        }
    }

    async _uploadScript(script) {
        const remoteScriptPath = path.join(this.workspace, REMOTE_SCRIPT_FILENAME);

        await this._logln(`Uploading script file, ${remoteScriptPath}`);
        try {
            await this.__ssh.upload(new Buffer(script), remoteScriptPath);
        } catch (error) {
            throw new Error(`Error uploading script to slave at ${remoteScriptPath}: ${error}`);
        }
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

    async _executeScript(jobInfo) {
        const env = this.getEnv(jobInfo);
        const remoteScriptPath = path.join(this.workspace, REMOTE_SCRIPT_FILENAME);

        await this._logln(`Executing script file, ${remoteScriptPath}`);
        this.__com.sendCommand("execute", { script: remoteScriptPath, env: env, data: jobInfo, id: this.jobId });
    }

    async _executeSlave() {
        const remoteScriptPath = path.join(this.workspace, REMOTE_SLAVE_SCRIPT);
        const command = `node --harmony_async_await ${remoteScriptPath} client ${this.workspace} ${this.port}`;

        await this._logln(`Executing slave command, ${command}`);

        const { stdin, stdout, stderr } = await this.__ssh.execute(command, (code) => {
            if (code !== 0) {
                this._logln(`Exited abnormaly with code ${code}`, LEVEL.ERROR);
                // TODO: Handle errors
            }
        });

        this.__com = new SlaveCom(stdin, stdout);

        stderr.on("data", (data) => {
            this._logln(`${data}`, LEVEL.ERROR);
        });
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

    getEnv(jobInfo) {
        return this._convToEnvObj(jobInfo, false, 6);
    }

    async allocate(job, slave) {
        this.jobId = job._id;
        this.jobName = job.name;
        this.slaveId = slave._id;

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
            await this._attach();
            await this._uploadScript(job.script);
            await this._executeScript(this.getJobInfo(job));
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

    async _attach() {
        await this._logln("Attaching to slave machine");

        await this._connect();
        await this._ensureWorkspace();
        await this._uploadSlave();
        await this._executeSlave();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(async () => {
                await this._logln("Attached failed: Timeout", LEVEL.ERROR);
                await this.detach(DETACH_REASON.FAILED_TO_ATTACH);
                reject("Timeout");
            }, ATTACH_TIMEOUT_MS);

            this.__com.on("failure", async (error, line) => {
                await this._logln(`Failed to handle incoming data, error: ${error}, line: ${line}`, LEVEL.ERROR);
                // TODO: Should we fail?
            });

            this.__com.on("ready", async (data) => {
                clearTimeout(timeout);

                if (data.online) {
                    this.port = data.port;
                    await this.save();
                    await this._logln(`Attached successfully on port ${this.port}`);
                    resolve();
                } else {
                    await this._logln(`Attached failed: ${data.msg}`, LEVEL.ERROR);
                    await this.remove();
                    await this.detach(DETACH_REASON.FAILED_TO_ATTACH);
                    reject(data.msg);
                }
            });

            this.__com.on("status", async (data) => {
                await this._logln(`Status - ${data.status}: ${data.msg}`);

                if (data.status === "offline" && !this.finished) {
                    await this._logln("Script finished abnormaly, executor is dead", LEVEL.ERROR);
                    await notification.emit(`${this.constructor.typeName}.failure`, this);
                    await this.detach(DETACH_REASON.FINISHED_WITH_ERROR);
                    await this.remove();
                }
            });

            this.__com.on("error", async (data) => {
                await this._logln(`Error - ${data.msg}, data: ${JSON.stringify(data.data)}`, LEVEL.ERROR);
            });

            this.__com.on("info", async (data) => {
                await this._logln(`Info - ${data.msg}, data: ${JSON.stringify(data.data)}`);
            });

            this.__com.on("stdout", async (data) => {
                await this._log(data.msg, LEVEL.STDOUT, "exe", data.time, data.lineNr);
            });

            this.__com.on("stderr", async (data) => {
                await this._log(data.msg, LEVEL.STDERR, "exe", data.time, data.lineNr);
            });

            this.__com.on("type_read", async (data) => {
                const getterStr = data.getter ? `/${data.getter}` : "";
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(`Job read type ${data.typeName}${idStr}${getterStr} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.type_read`, data.contextId, this, data.typeName, data.id, data.getter);
            });

            this.__com.on("type_create", async (data) => {
                await this._logln(`Job create type ${data.typeName} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.type_create`, data.contextId, this, data.typeName, data.data);
            });

            this.__com.on("type_update", async (data) => {
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(`Job update type ${data.typeName}${idStr} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.type_update`, data.contextId, this, data.typeName, data.id, data.data);
            });

            this.__com.on("type_action", async (data) => {
                const actionStr = data.action ? `/${data.action}` : "";
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(`Job type action ${data.typeName}${idStr}${actionStr} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.type_action`, data.contextId, this, data.typeName, data.id, data.action, data.data);
            });

            this.__com.on("file_upload", async (data) => {
                await this._logln(`Job upload ${data.kind} with slave path ${data.data.path} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.file_upload`, data.contextId, this, data.kind, data.data);
            });

            this.__com.on("revision_merge", async (data) => {
                await this._logln(`Job merge revision ${data.revisionId} requested in context ${data.contextId}`);
                notification.emit(`${this.constructor.typeName}.revision_merge`, data.contextId, this, data.revisionId, data.data);
            });

            this.__com.on("executing", async () => {
                await this._logln("Script has started executing");
                this.executing = true;
                await this.save();
                await notification.emit(`${this.constructor.typeName}.executing`, this);
            });

            this.__com.on("finish", async (data) => {
                await this._logln(`Script finished with result: ${data.result}`);
                this.finished = true;
                await this.save();
                await notification.emit(`${this.constructor.typeName}.finished`, this, data.result);
                await this.detach(data.result === "success" ? DETACH_REASON.FINISHED_WITH_SUCCESS : DETACH_REASON.FINISHED_WITH_ERROR);
                await this.remove();
            });
        });
    }

    async detach(reason) {
        if (!this.__com) {
            return;
        }

        this.__com.removeAllListeners();
        await this.__com.destroy();
        this.__com = false;

        if (this.workspaceCleanup === Job.CLEANUP_POLICY.KEEP) {
            // Do nothing
        } else if (this.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_ON_FINISH) {
            if (reason === DETACH_REASON.FINISHED_WITH_ERROR || reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace();
            }
        } else if (this.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_ON_SUCCESS) {
            if (reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace();
            }
        } else if (this.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_WHEN_NEEDED) {
            // TODO: Write a _TO_BE_REMOVED file to the workspace so it can be,
            // cleaned up later by a sweep. For now we just remove it directly.
            if (reason === DETACH_REASON.FINISHED_WITH_ERROR || reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace();
            }
        }

        await this.__ssh.disconnect();
        await this._logln(`Detached, reason ${reason}`);
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
