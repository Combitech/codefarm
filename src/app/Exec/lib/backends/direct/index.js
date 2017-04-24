"use strict";

const { AsyncEventEmitter } = require("emitter");
const Job = require("../../types/job");

class DirectBackend extends AsyncEventEmitter {
    constructor(id, backend) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
    }

    async start() {
    }

    async dispose() {
    }

    // Return a slave verification job to be run on this backend
    async verifySlaveJob(slave) {
        return new Job({
            name: `Verify_slave_${slave._id}`,
            // All slaves have their ID as a tag... This will match a specific slave
            criteria: `${slave._id}`,
            requeueOnFailure: false,
            script: `echo My job is to verify slave ${slave._id}`,
            baseline: false,
            workspaceCleanup: Job.CLEANUP_POLICY.REMOVE_ON_SUCCESS
        });
    }

    get backendType() {
        return this.backend.backendType;
    }
}

module.exports = DirectBackend;
