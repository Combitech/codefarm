"use strict";

const { AsyncEventEmitter } = require("emitter");
const { SshClient } = require("ssh");
const url = require("url");
const path = require("path");
const moment = require("moment");
const { RawLogClient } = require("loglib");
const { ServiceMgr } = require("service");
const fs = require("fs-extra-promise");
const { SlaveCom } = require("../../slavecom");
const { notification } = require("typelib");
const Job = require("../../types/job");

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

class DirectBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
    }

    async start() {
    }

    async _logln(executor, str, level = LEVEL.INFO, tag = "sys") {
        const time = moment().utc().format();
        await this._log(executor, `${str}\n`, level, tag, time);
    }

    async _log(executor, str, level = LEVEL.STDOUT, tag = "exe", time, lineNr = false) {
        str = str.replace(/\n$/, "");

        for (const line of str.split("\n")) {
            if (executor.logId) {
                await RawLogClient.instance.append(executor.logId, time, level, tag, line, lineNr);
            }

            const prefix = `${tag.toUpperCase()}:${level}`;
            ServiceMgr.instance.log("info", `Executor[${executor._id}]: Slave[${executor.slaveId}]: Job[${executor.jobId}]: [${prefix}] ${line}`);
        }
    }

    async _connect(executor) {
        const info = url.parse(executor.uri);
        const privateKey = await fs.readFileAsync(executor.privateKeyPath);

        await this._logln(executor, `Connecting to ssh, ${executor.uri}`);

        executor.__ssh = new SshClient();
        await executor.__ssh.connect({
            host: info.hostname,
            port: info.port || 22,
            username: info.auth || process.env.USER,
            privateKey: privateKey,
            useSftp: true
        }, async (error) => {
            await this._logln(executor, `SSH error: ${JSON.stringify(error, null, 2)}`, LEVEL.ERROR);
        });
    }

    async _ensureWorkspace(executor) {
        try {
            await this._logln(executor, `Ensuring workspace, ${executor.workspace}`);
            await executor.__ssh.mkdir(path.dirname(executor.workspace));
            await executor.__ssh.mkdir(executor.workspace);
        } catch (error) {
            throw new Error(`Error creating slave workspace at ${executor.workspace}: ${error}`);
        }
    }

    async _removeWorkspace(executor) {
        try {
            await this._logln(executor, `Removing workspace, ${executor.workspace}`);
            await this.__ssh.rmdir(executor.workspace);
        } catch (error) {
            throw new Error(`Error removing slave workspace at ${executor.workspace}: ${error}`);
        }
    }

    async _uploadSlave(executor) {
        const files = {
            [ REMOTE_SLAVE_SCRIPT ]: {
                localPath: path.join(__dirname, "..", "..", "..", "build", REMOTE_SLAVE_SCRIPT),
                remotePath: path.join(executor.workspace, REMOTE_SLAVE_SCRIPT)
            },
            "cli.js": {
                localPath: path.join(__dirname, "..", "..", "..", "build", "cli.js"),
                remotePath: path.join(executor.workspace, "cli.js")
            }
        };

        for (const fileInfo of Object.values(files)) {
            await this._logln(executor, `Uploading slave file, local: ${fileInfo.localPath} remote: ${fileInfo.remotePath}`);
            try {
                await executor.__ssh.upload(fileInfo.localPath, fileInfo.remotePath);
            } catch (error) {
                throw new Error(`Error uploading context to slave at ${fileInfo.remotePath}: ${error}`);
            }
        }
    }

    async _executeSlave(executor) {
        const remoteScriptPath = path.join(executor.workspace, REMOTE_SLAVE_SCRIPT);
        const command = `node --harmony_async_await ${remoteScriptPath} client ${executor.workspace} ${executor.port}`;

        await this._logln(executor, `Executing slave command, ${command}`);

        const { stdin, stdout, stderr } = await executor.__ssh.execute(command, (code) => {
            if (code !== 0) {
                this._logln(executor, `Exited abnormaly with code ${code}`, LEVEL.ERROR);
                // TODO: Handle errors
            }
        });

        executor.__com = new SlaveCom(stdin, stdout);

        stderr.on("data", (data) => {
            this._logln(executor, `${data}`, LEVEL.ERROR);
        });
    }

    async attach(executor) {
        await this._logln(executor, "Attaching to slave machine");

        await this._connect(executor);
        await this._ensureWorkspace(executor);
        await this._uploadSlave(executor);
        await this._executeSlave(executor);

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(async () => {
                await this._logln(executor, "Attached failed: Timeout", LEVEL.ERROR);
                await this.detach(executor, DETACH_REASON.FAILED_TO_ATTACH);
                reject("Timeout");
            }, ATTACH_TIMEOUT_MS);

            executor.__com.on("failure", async (error, line) => {
                await this._logln(executor, `Failed to handle incoming data, error: ${error}, line: ${line}`, LEVEL.ERROR);
                // TODO: Should we fail?
            });

            executor.__com.on("ready", async (data) => {
                clearTimeout(timeout);

                if (data.online) {
                    executor.port = data.port;
                    await executor.save();
                    await this._logln(executor, `Attached successfully on port ${this.port}`);
                    resolve();
                } else {
                    await this._logln(executor, `Attached failed: ${data.msg}`, LEVEL.ERROR);
                    await executor.remove();
                    await this.detach(executor, DETACH_REASON.FAILED_TO_ATTACH);
                    reject(data.msg);
                }
            });

            executor.__com.on("status", async (data) => {
                await this._logln(executor, `Status - ${data.status}: ${data.msg}`);

                if (data.status === "offline" && !executor.finished) {
                    await this._logln(executor, "Script finished abnormaly, executor is dead", LEVEL.ERROR);
                    await notification.emit(`${executor.constructor.typeName}.failure`, executor);
                    await this.detach(executor, DETACH_REASON.FINISHED_WITH_ERROR);
                    await executor.remove();
                }
            });

            executor.__com.on("error", async (data) => {
                await this._logln(executor, `Error - ${data.msg}, data: ${JSON.stringify(data.data)}`, LEVEL.ERROR);
            });

            executor.__com.on("info", async (data) => {
                await this._logln(executor, `Info - ${data.msg}, data: ${JSON.stringify(data.data)}`);
            });

            executor.__com.on("stdout", async (data) => {
                await this._log(executor, data.msg, LEVEL.STDOUT, "exe", data.time, data.lineNr);
            });

            executor.__com.on("stderr", async (data) => {
                await this._log(executor, data.msg, LEVEL.STDERR, "exe", data.time, data.lineNr);
            });

            executor.__com.on("type_read", async (data) => {
                const getterStr = data.getter ? `/${data.getter}` : "";
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(executor, `Job read type ${data.typeName}${idStr}${getterStr} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.type_read`, data.contextId, executor, data.typeName, data.id, data.getter);
            });

            executor.__com.on("type_create", async (data) => {
                await this._logln(executor, `Job create type ${data.typeName} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.type_create`, data.contextId, executor, data.typeName, data.data);
            });

            executor.__com.on("type_update", async (data) => {
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(executor, `Job update type ${data.typeName}${idStr} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.type_update`, data.contextId, executor, data.typeName, data.id, data.data);
            });

            executor.__com.on("type_action", async (data) => {
                const actionStr = data.action ? `/${data.action}` : "";
                const idStr = data.id ? `/${data.id}` : "";
                await this._logln(executor, `Job type action ${data.typeName}${idStr}${actionStr} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.type_action`, data.contextId, executor, data.typeName, data.id, data.action, data.data);
            });

            executor.__com.on("file_upload", async (data) => {
                await this._logln(executor, `Job upload ${data.kind} with slave path ${data.data.path} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.file_upload`, data.contextId, executor, data.kind, data.data);
            });

            executor.__com.on("revision_merge", async (data) => {
                await this._logln(executor, `Job merge revision ${data.revisionId} requested in context ${data.contextId}`);
                notification.emit(`${executor.constructor.typeName}.revision_merge`, data.contextId, executor, data.revisionId, data.data);
            });

            executor.__com.on("executing", async () => {
                await this._logln(executor, "Script has started executing");
                executor.executing = true;
                await executor.save();
                await notification.emit(`${executor.constructor.typeName}.executing`, executor);
            });

            executor.__com.on("finish", async (data) => {
                await this._logln(executor, `Script finished with result: ${data.result}`);
                executor.finished = true;
                await executor.save();
                await notification.emit(`${executor.constructor.typeName}.finished`, executor, data.result);
                await this.detach(executor, data.result === "success" ? DETACH_REASON.FINISHED_WITH_SUCCESS : DETACH_REASON.FINISHED_WITH_ERROR);
                await executor.remove();
            });
        });
    }

    async detach(executor, reason) {
        if (!executor.__com) {
            return;
        }

        executor.__com.removeAllListeners();
        await executor.__com.destroy();
        executor.__com = false;

        if (executor.workspaceCleanup === Job.CLEANUP_POLICY.KEEP) {
            // Do nothing
        } else if (executor.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_ON_FINISH) {
            if (reason === DETACH_REASON.FINISHED_WITH_ERROR || reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace(executor);
            }
        } else if (executor.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_ON_SUCCESS) {
            if (reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace(executor);
            }
        } else if (executor.workspaceCleanup === Job.CLEANUP_POLICY.REMOVE_WHEN_NEEDED) {
            // TODO: Write a _TO_BE_REMOVED file to the workspace so it can be,
            // cleaned up later by a sweep. For now we just remove it directly.
            if (reason === DETACH_REASON.FINISHED_WITH_ERROR || reason === DETACH_REASON.FINISHED_WITH_SUCCESS) {
                await this._removeWorkspace(executor);
            }
        }

        await executor.__ssh.disconnect();
        await this._logln(executor, `Detached, reason ${reason}`);
    }

    async _uploadScript(executor, script) {
        const remoteScriptPath = path.join(executor.workspace, REMOTE_SCRIPT_FILENAME);

        await this._logln(executor, `Uploading script file, ${remoteScriptPath}`);
        try {
            await executor.__ssh.upload(new Buffer(script), remoteScriptPath);
        } catch (error) {
            throw new Error(`Error uploading script to slave at ${remoteScriptPath}: ${error}`);
        }
    }

    async _executeScript(executor, jobInfo) {
        const env = executor.getEnv(jobInfo);
        const remoteScriptPath = path.join(executor.workspace, REMOTE_SCRIPT_FILENAME);

        await this._logln(executor, `Executing script file, ${remoteScriptPath}`);
        executor.__com.sendCommand("execute", { script: remoteScriptPath, env: env, data: jobInfo, id: executor.jobId });
    }


    async startJob(job, executor) {
        await this.attach(executor);
        await this._uploadScript(executor, job.script);
        await this._executeScript(executor, executor.getJobInfo(job));
    }

    async dispose() {
    }

}

module.exports = DirectBackend;
