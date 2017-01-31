"use strict";

const { notification } = require("typelib");
const { TagCriteria, assertType, synchronize } = require("misc");
const Slave = require("./types/slave");
const Job = require("./types/job");
const Executor = require("./types/executor");
const { ServiceMgr } = require("service");

let instance;

class Control {
    constructor() {
        this.executors = [];

        synchronize(this, "_startJobs");
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        notification.on("slave.created", async () => {
            await this._startJobs();
        });

        notification.on("job.created", async () => {
            await this._startJobs();
        });

        notification.on("job.requeued", async () => {
            await this._startJobs();
        });

        notification.on("slave.tagged", async () => {
            await this._startJobs();
        });

        notification.on("slave.untagged", async () => {
            await this._startJobs();
        });

        notification.on("slave.online", async () => {
            await this._startJobs();
        });

        notification.on("slave.offline", async (slave) => {
            const executors = this.executors.filter((executor) => executor.slaveId === slave._id);

            for (const executor of executors) {
                await executor.abort();
            }
        });

        notification.on("slave.removed", async (slave) => {
            const executors = this.executors.filter((executor) => executor.slaveId === slave._id);

            for (const executor of executors) {
                await executor.abort();
            }
        });

        notification.on("job.removed", async (job) => {
            const executor = this.executors.find((executor) => executor.jobId === job._id);

            if (executor) {
                await executor.abort();
            }
        });

        notification.on("executor.removed", async (executor) => {
            this.executors.splice(this.executors.indexOf(executor), 1);
            await this._startJobs();
        });

        notification.on("executor.allocated", async (executor) => {
            const job = await Job.findOne({ _id: executor.jobId });
            await job.setOngoing(executor.slaveId, executor.logId);
        });

        notification.on("executor.finished", async (executor, result) => {
            const job = await Job.findOne({ _id: executor.jobId });
            await job.setFinished(result);
        });

        notification.on("executor.failure", async (executor) => {
            const slave = await Slave.findOne({ _id: executor.slaveId });
            slave.offline = true;
            await slave.save();

            const job = await Job.findOne({ _id: executor.jobId });
            if (job.requeueOnFailure) {
                await job.setReset();
            } else {
                await job.setFinished("aborted");
            }
        });

        const archiveFile = async (dstServiceName, typeName, id, fileStream) => {
            const serviceRest = await ServiceMgr.instance.use(dstServiceName);
            const response = await serviceRest.postMultipart(`/${typeName}/${id}/upload`, {
                file: fileStream
            });

            return response.result === "success" ? response.data : false;
        };

        const mergeRevision = async (id) => {
            const serviceRest = await ServiceMgr.instance.use("coderepo");
            const response = await serviceRest.post(`/revision/${id}/merge`);

            return response.result === "success" ? response.data : false;
        };

        const readType = async (typeName, id, getter) => {
            const [ serviceName, type ] = typeName.split(".");
            const serviceRest = await ServiceMgr.instance.use(serviceName);
            const getterStr = getter ? `/${getter}` : "";
            const idStr = id ? `/${id}` : "";
            const response = await serviceRest.get(`/${type}${idStr}${getterStr}`);

            return response;
        };

        notification.on("executor.type_read", async (executor, typeName, id, getter) => {
            try {
                const obj = await readType(typeName, id, getter);
                await executor.notifyInfo("type_read", obj);
            } catch (error) {
                console.error("type_read error", error);
                await executor.notifyError(error.message || error);
            }
        });

        notification.on("executor.type_create", async (executor, typeName, data) => {
            try {
                let obj;
                const job = await Job.findOne({ _id: executor.jobId });
                if (!job) {
                    throw new Error(`Job ${executor.jobId} not found`);
                }
                switch (typeName) {
                case "artifactrepo.artifact":
                    obj = await executor.createType(typeName, data);
                    if (obj._id) {
                        await job.addArtifact(obj.name, obj.repository, obj.version, obj._id);
                    } else {
                        throw new Error("No artifact id");
                    }
                    break;
                case "exec.subjob":
                    const subJob = Object.assign({ jobId: executor.jobId }, data);
                    obj = await executor.createType(typeName, subJob);
                    if (obj._id) {
                        await job.addSubJob(obj.name, obj._id);
                    } else {
                        throw new Error("No subJob id");
                    }
                    break;
                default:
                    throw new Error(`Type ${typeName} not supported`);
                }
                await executor.notifyInfo("type_created", obj);
            } catch (error) {
                console.error("type_create error", error);
                await executor.notifyError(error.message || error);
            }
        });

        notification.on("executor.type_action", async (executor, typeName, id, action, data) => {
            try {
                const obj = await executor.typeAction(typeName, id, action, data);
                await executor.notifyInfo("type_action_done", obj);
            } catch (error) {
                console.error("type_action error", error);
                await executor.notifyError(error.message || error);
            }
        });

        notification.on("executor.type_update", async (executor, typeName, id, data) => {
            try {
                let obj;
                switch (typeName) {
                case "exec.subjob":
                    obj = await executor.updateType(typeName, id, data);
                    break;
                default:
                    throw new Error(`Type ${typeName} not supported`);
                }
                await executor.notifyInfo("type_updated", obj);
            } catch (error) {
                console.error("type_update error", error);
                await executor.notifyError(error.message || error);
            }
        });

        notification.on("executor.file_upload", async (executor, kind, data) => {
            try {
                assertType(data.path, "data.path", "string");
                let obj;
                const job = await Job.findOne({ _id: executor.jobId });
                if (!job) {
                    throw new Error(`Job ${executor.jobId} not found`);
                }
                switch (kind) {
                case "artifact":
                    let artifactId = data.artifactId;
                    if (!artifactId) {
                        // No artifactId given create artifact
                        if (data.name && data.repository) {
                            const response = await executor.createType("artifactrepo.artifact", {
                                name: data.name,
                                repository: data.repository,
                                version: data.version,
                                tags: data.tags
                            });
                            artifactId = response ? response._id : false;
                        } else {
                            throw new Error(`data must contain either artifactId or name and repository, data=${JSON.stringify(data)}`);
                        }
                    }
                    if (artifactId) {
                        const fileStream = await executor.downloadFileAsStream(data.path);
                        obj = await archiveFile("artifactrepo", "artifact", artifactId, fileStream);
                    } else {
                        throw new Error("No artifact id");
                    }
                    break;
                case "log":
                    let logId = data.logId;
                    if (!logId) {
                        // No logId given create log
                        if (data.name) {
                            logId = await executor.allocateLog(data.name, data.tags || []);
                        } else {
                            throw new Error(`data must contain either logId or name, data=${JSON.stringify(data)}`);
                        }
                    }
                    if (logId) {
                        const fileStream = await executor.downloadFileAsStream(data.path);
                        obj = await archiveFile("logrepo", "log", logId, fileStream);
                        await job.addLog(obj.name, obj._id);
                    } else {
                        throw new Error("No log id");
                    }
                    break;
                default:
                    throw new Error(`upload_file of ${kind} not supported`);
                }
                await executor.notifyInfo("file_uploaded", obj);
            } catch (error) {
                console.error("file_upload error", error);
                await executor.notifyError(error.message || error);
            }
        });

        notification.on("executor.revision_merge", async (executor, revisionId /* data */) => {
            try {
                let obj;
                const job = await Job.findOne({ _id: executor.jobId });
                if (!job) {
                    throw new Error(`Job ${executor.jobId} not found`);
                }
                if (revisionId) {
                    obj = await mergeRevision(revisionId);
                    await job.addRevision(obj._id, "merged");
                } else {
                    throw new Error("No revision id");
                }
                await executor.notifyInfo("revision_merged", obj);
            } catch (error) {
                console.error("revision_merge error", error);
                await executor.notifyError(error.message || error);
            }
        });

        this.executors = await Executor.findMany();

        for (const executor of this.executors) {
            try {
                await executor.resume();
            } catch (error) {
                console.error("Error resuming executor", error);
            }
        }

        await this._startJobs();
    }

    async _getSlaveExecList() {
        const slaves = await Slave.findMany({ offline: false });

        // Sort on the slaves with the most resources free on top
        return slaves
        .map((slave) => {
            const executors = this.executors.filter((executor) => executor.slaveId === slave._id);

            return {
                slave: slave,
                free: slave.executors - executors.length
            };
        });
    }

    async _startJobs() {
        // TODO: Optimize, _startJobs is now synchronized and is a bottle-neck...
        const jobs = await Job.findMany({ status: "queued" }, { sort: [ [ "created", -1 ] ] });

        const slavesExec = await this._getSlaveExecList();
        slavesExec.sort((a, b) => b.free - a.free);

        for (const job of jobs) {
            let slaveExec;
            if (job.executeOnSlaveId) {
                slaveExec = slavesExec.find((slaveExec) => slaveExec.free > 0 && job.executeOnSlaveId === slaveExec.slave._id);
            } else {
                const tagCriteria = new TagCriteria(job.criteria);
                slaveExec = slavesExec.find((slaveExec) => slaveExec.free > 0 && tagCriteria.match(slaveExec.slave.tags));
            }

            if (slaveExec) {
                const executor = new Executor();
                this.executors.push(executor);
                try {
                    await executor.start(job, slaveExec.slave);
                } catch (error) {
                    console.error("Error starting executor", error);
                }
                slaveExec.free--;
                slavesExec.sort((a, b) => b.free - a.free);
            }
        }
    }

    async _waitForJobCompletion(jobId) {
        return new Promise((resolve) => {
            let oldJobStatus = "queued";
            const jobUpdatedHandler = (job) => {
                if (job._id === jobId) {
                    if (oldJobStatus === "ongoing" && job.status !== "ongoing") {
                        // Transition from ongoing means that job have executed...
                        notification.removeListener("job.updated", jobUpdatedHandler);
                        resolve(job);
                    }
                    oldJobStatus = job.status;
                }
            };
            notification.on("job.updated", jobUpdatedHandler);
        });
    }

    async verifySlave(slave) {
        let slaveOk = false;
        let msg = "";
        if (!slave.offline) {
            const job = new Job({
                name: `Verify_slave_${slave._id}`,
                executeOnSlaveId: slave._id, // Exec on explicit slave instead criteria matching...
                requeueOnFailure: false,
                script: `#!/bin/bash
                    echo "My job is to verify slave ${slave._id}"
                    echo "Job id: $CF_JOB_ID"
                    echo "Job name: $CF_JOB_NAME"
                `,
                baseline: {
                    _id: "dummy-baseline-1",
                    name: `Dummy baseline to verify slave ${slave._id}`,
                    content: []
                }
            });
            const finishedJobPromise = this._waitForJobCompletion(job._id);
            job.save();

            const finishedJob = await finishedJobPromise;
            slaveOk = finishedJob.status === "success";
            if (!slaveOk) {
                msg = `Test job didn't finish successfully, status is ${finishedJob.status}`;
            }
        } else {
            msg = "Slave offline";
        }

        return { ok: slaveOk, msg: msg };
    }

    async dispose() {
        notification.removeAllListeners("slave.created");
        notification.removeAllListeners("job.created");
        notification.removeAllListeners("slave.tagged");
        notification.removeAllListeners("slave.untagged");
        notification.removeAllListeners("slave.removed");
        notification.removeAllListeners("job.removed");
        notification.removeAllListeners("executor.removed");
        notification.removeAllListeners("executor.allocated");
        notification.removeAllListeners("executor.finished");
        notification.removeAllListeners("executor.failure");

        for (const executor of this.executors) {
            await executor.detach();
        }
    }
}

module.exports = Control;
