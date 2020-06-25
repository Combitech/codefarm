"use strict";

const { notification } = require("typelib");
const { ServiceComBus } = require("servicecom");
const { TagCriteria, assertType, synchronize } = require("misc");
const singleton = require("singleton");
const Slave = require("./types/slave");
const Job = require("./types/job");
const Executor = require("./types/executor");
const { ServiceMgr } = require("service");
const BackendProxy = require("./backend_proxy");

class Control {
    constructor() {
        this.executors = [];

        synchronize(this, "_allocateJob");
    }

    async start() {
        notification.on("slave.created", async () => {
            await this._startJobs();
        });

        notification.on("slave.updated", async () => {
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

        notification.on("job.aborted", async (job) => {
            const executor = this.executors.find((executor) => executor.jobId === job._id);

            if (executor) {
                await executor.abort();
            } else {
                await job.setFinished("aborted");
            }
        });

        notification.on("executor.removed", async (executor) => {
            this.executors.splice(this.executors.indexOf(executor), 1);
            await this._startJobs();
        });

        notification.on("executor.allocated", async (executor) => {
            const job = await Job.findOne({ _id: executor.jobId });
            await job.setAllocated(executor.slaveId);
        });

        notification.on("executor.started", async (executor) => {
            const job = await Job.findOne({ _id: executor.jobId });
            await job.setOngoing(executor.logId);
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
            const client = await ServiceMgr.instance.use(dstServiceName);

            return client.upload(typeName, id, fileStream);
        };

        const mergeRevision = async (id) => {
            const client = ServiceComBus.instance.getClient("coderepo");

            return client.merge("revision", id);
        };

        const readType = async (type, id, getter) => {
            const [ serviceName, typeName ] = type.split(".");
            const client = ServiceComBus.instance.getClient(serviceName);

            return client[getter || "get"](typeName, id);
        };

        notification.on("executor.type_read", async (contextId, executor, typeName, id, getter) => {
            try {
                const obj = await readType(typeName, id, getter);
                await executor.notifyInfo("type_read", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "type_read error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        notification.on("executor.type_create", async (contextId, executor, typeName, data) => {
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
                await executor.notifyInfo("type_created", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "type_create error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        notification.on("executor.type_action", async (contextId, executor, typeName, id, action, data) => {
            try {
                const obj = await executor.typeAction(typeName, id, action, data);
                await executor.notifyInfo("type_action_done", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "type_action error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        notification.on("executor.type_update", async (contextId, executor, typeName, id, data) => {
            try {
                let obj;
                switch (typeName) {
                case "exec.subjob":
                    obj = await executor.updateType(typeName, id, data);
                    break;
                default:
                    throw new Error(`Type ${typeName} not supported`);
                }
                await executor.notifyInfo("type_updated", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "type_update error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        notification.on("executor.file_upload", async (contextId, executor, kind, data) => {
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
                await executor.notifyInfo("file_uploaded", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "file_upload error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        notification.on("executor.revision_merge", async (contextId, executor, revisionId /* data */) => {
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
                await executor.notifyInfo("revision_merged", contextId, obj);
            } catch (error) {
                ServiceMgr.instance.log("error", "revision_merge error", error);
                await executor.notifyError(contextId, error.message || error);
            }
        });

        this.executors = await Executor.findMany();

        for (const executor of this.executors) {
            try {
                await executor.resume();
            } catch (error) {
                ServiceMgr.instance.log("error", "Error resuming executor", error);
            }
        }

        await this._startJobs();
    }

    async _getSlaveExecList() {
        const slaves = await Slave.findMany({ offline: false });

        return slaves.map((slave) => {
            const numRunningOnSlave = this.executors.filter((executor) => executor.slaveId === slave._id).length;

            return {
                slave: slave,
                free: slave.executors - numRunningOnSlave
            };
        });
    }

    async _getLeastUtilizedSlave(tagCriteria) {
        let slave = false;
        let slaveExecList = await this._getSlaveExecList();
        slaveExecList = slaveExecList.sort((a, b) => b.free - a.free);
        if (slaveExecList.length > 0) {
            const slaveExec = slaveExecList.find((slaveExec) =>
                slaveExec.free > 0 && tagCriteria.match(slaveExec.slave.tags)
            );
            if (slaveExec) {
                slave = slaveExec.slave;
            }
        }

        return slave;
    }

    async _getOldestJob(excludeJobIds = []) {
        const query = {
            status: "queued"
        };
        if (excludeJobIds.length > 0) {
            query._id = {
                $nin: excludeJobIds
            };
        }
        const jobs = await Job.findMany(query, {
            sort: [ [ "created", -1 ] ],
            limit: 1
        });

        return jobs.length === 1 ? jobs[0] : false;
    }

    async _allocateJob(excludeJobIds = []) {
        const job = await this._getOldestJob(excludeJobIds);
        if (!job) {
            ServiceMgr.instance.log("info", "_allocateJob - found no jobs");

            return false;
        }

        const tagCriteria = new TagCriteria(job.criteria);
        const leastUtlizedSlave = await this._getLeastUtilizedSlave(tagCriteria);
        if (!leastUtlizedSlave) {
            ServiceMgr.instance.log("info", `_allocateJob - found no available slave matching criteria ${job.criteria}`);

            return false;
        }

        // Allocate executor
        let executor = Executor.construct({ backend: leastUtlizedSlave.backend });
        this.executors.push(executor);
        try {
            // allocate on an executor will trigger the event executor.allocated which
            // will set the job to ongoing
            await executor.allocate(job, leastUtlizedSlave);
            ServiceMgr.instance.log("info", `_allocateJob - Allocated executor ${executor._id} on slave ${leastUtlizedSlave._id} for job ${job._id}`);
        } catch (error) {
            ServiceMgr.instance.log("error", "Error allocating executor", error);
            executor = null;
        }

        return {
            job: job,
            executor: executor
        };
    }

    async _startJobs() {
        let alloc;
        const skipJobIds = [];
        let numJobsStarted = 0;
        while (alloc = await this._allocateJob(skipJobIds)) {
            const executor = alloc.executor;
            if (executor) {
                try {
                    ServiceMgr.instance.log("verbose", `_startJobs - starting job ${alloc.job._id}`);
                    await executor.start(alloc.job);
                    numJobsStarted++;
                } catch (error) {
                    ServiceMgr.instance.log("error", "Error starting executor", error);
                }
            } else {
                ServiceMgr.instance.log("verbose", `_startJobs - skipping job ${alloc.job._id}`);
                // Failed to allocate executor, skip this job ID again
                skipJobIds.push(alloc.job._id);
            }
        }
        ServiceMgr.instance.log("info", `_startJobs - started ${numJobsStarted} jobs`);
    }

    async _waitForJobCompletion(jobId) {
        return new Promise((resolve, reject) => {
            let oldJobStatus = "queued";
            const jobUpdatedHandler = (job) => {
                if (job._id === jobId) {
                    if (oldJobStatus === "ongoing" && job.status !== "ongoing") {
                        // Transition from ongoing means that job have executed...
                        notification.removeListener("job.updated", jobUpdatedHandler);
                        resolve(job);
                    } else if (job.status === "aborted") {
                        // Transition from ongoing means that job have executed...
                        notification.removeListener("job.updated", jobUpdatedHandler);
                        reject(new Error("Job aborted"));
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
            const job = await BackendProxy.instance.verifySlaveJob(slave);
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
        notification.removeAllListeners("slave.updated");
        notification.removeAllListeners("job.created");
        notification.removeAllListeners("job.requeued");
        notification.removeAllListeners("slave.tagged");
        notification.removeAllListeners("slave.untagged");
        notification.removeAllListeners("slave.online");
        notification.removeAllListeners("slave.offline");
        notification.removeAllListeners("slave.removed");
        notification.removeAllListeners("job.removed");
        notification.removeAllListeners("executor.removed");
        notification.removeAllListeners("executor.allocated");
        notification.removeAllListeners("executor.started");
        notification.removeAllListeners("executor.finished");
        notification.removeAllListeners("executor.failure");
        notification.removeAllListeners("executor.type_read");
        notification.removeAllListeners("executor.type_create");
        notification.removeAllListeners("executor.type_action");
        notification.removeAllListeners("executor.type_update");
        notification.removeAllListeners("executor.file_upload");
        notification.removeAllListeners("executor.revision_merge");

        for (const executor of this.executors) {
            await executor.detach();
        }
    }
}

module.exports = singleton(Control);
