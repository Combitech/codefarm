"use strict";

const { ServiceMgr } = require("service");
// const { ServiceComBus } = require("servicecom");
// const rp = require("request-promise");
// const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const BitBucketEventEmitter = require("./bitbucket_event_emitter");

/*
To get started with BitBucket:
* Install plugin "Post-Receive WebHooks" in BitBucket Server
* Configure Webhook service through repository->config->hooks
** Needs enabling and pointing to Codefarm receiver address
*/

class BitBucketBackend extends AsyncEventEmitter {
    constructor(id, backend, Repository, Revision) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
        this.Repository = Repository;
        this.Revision = Revision;
        this.baseUrl = this.backend.serverUrl;
        this.apiBaseUrl = `${this.baseUrl}/rest/api/1.0`;
        this.bitBucketEmitter = new BitBucketEventEmitter(
            ServiceMgr.instance.log.bind(ServiceMgr.instance)
        );
    }

    async start() {
        // Start event monitoring towards GitLab
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup BitBucket webhook server: ${err}`);
        }
    }

    async _startMonitorEventStream() {
        return await this.bitBucketEmitter.start(this.backend.port);
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate gerrit specific options
    }

    async create(/* repository */) {
        throw Error("Not implemented");
    }

    async merge(/* repository, revision */) {
        throw Error("Not implemented");
    }

    async getUri(/* backend, repository */) {
        throw Error("Not implemented");
    }

    async update(/* repository */) {
        // TODO: Implement update
        throw Error("Not implemented");
    }

    async setVerified(/* repository, revision */) {
        // TODO: Implement setVerified
        throw Error("Not implemented");
    }

    async remove(/* repository */) {
        throw Error("Not implemented");
    }

    async dispose() {
        this.removeAllListeners();
        this.bitBucketEmitter.removeAllListeners();
        await this.bitBucketEmitter.dispose();
    }
}

module.exports = BitBucketBackend;
