"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

const KIND = {
    BUILD: "build",
    TEST: "test"
};

const STATUS = {
    ONGOING: "ongoing",
    SUCCESS: "success",
    ABORTED: "aborted",
    FAIL: "fail",
    SKIP: "skip"
};

const values = (obj) => Object.keys(obj).map((key) => obj[key]);

class SubJob extends Type {
    constructor(data) {
        super();

        this.name = false;
        this.kind = false;
        this.finished = false;
        this.jobId = false;
        this.status = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "subjob";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    async _saveHook(olddata) {
        const notFinishedStatusList = [ STATUS.ONGOING ];
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
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", false);
            assertType(data.name, "data.name", "string");
            assertType(data.kind, "data.kind", "string");
            assertType(data.status, "data.status", "string");
            assertType(data.jobId, "data.jobId", "string");

            if (values(KIND).indexOf(data.kind) === -1) {
                throw new Error(`Illegal SubJob kind ${data.kind}`);
            }
            if (values(STATUS).indexOf(data.status) === -1) {
                throw new Error(`Illegal SubJob status ${data.status}`);
            }
        } else if (event === "update") {
            assertProp(data, "name", false);
            assertProp(data, "kind", false);
            assertProp(data, "jobId", false);
            if (data.status) {
                assertType(data.status, "data.status", "string");

                if (values(STATUS).indexOf(data.status) === -1) {
                    throw new Error(`Illegal SubJob status ${data.status}`);
                }
            }
        }
    }

    async setFinished(result) {
        if (values(STATUS).indexOf(result) === -1) {
            throw new Error(`Illegal SubJob status ${result}`);
        }
        this.status = result;
        await this.save();
    }
}

module.exports = SubJob;
