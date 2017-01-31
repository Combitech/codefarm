"use strict";

const { serviceMgr } = require("service");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");
const Repository = require("./repository");

class Revision extends Type {
    constructor(data) {
        super();

        this.repository = false;
        this.status = "submitted";
        this.patches = [];

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "revision";
    }

    static async _getDb() {
        return await serviceMgr.use("db");
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    static async allocate(repoId, id, patch) {
        let revision = await this.findOne({ _id: id });

        if (!revision) {
            revision = new Revision({
                _id: id,
                repository: repoId
            });
        }

        revision.patches.push(patch);

        // If we get a new patch we should restart the flow and thus need
        // to remove all tags set by steps.
        revision.tags = revision.tags.filter((tag) => !tag.startsWith("step:"));

        await revision.save();

        return revision;
    }

    async merge(parentIds = []) {
        if (this.status === "merged") {
            throw new Error("Revision already merged");
        }

        if (this.patches.length === 0) {
            throw new Error("No ref to merge for revision");
        }

        const repository = await Repository.findOne({ _id: this.repository });
        // TODO: Any asynchronous updates done by backend isn't updated in this
        const ref = await BackendProxy.instance.merge(repository, this);

        if (ref) {
            // Some backends calls setMerged by them self...
            await this.setMerged(ref, parentIds);
        }
    }

    async setMerged(ref, parentIds = []) {
        if (this.status === "merged") {
            throw new Error("Revision already merged");
        }

        if (this.patches.length === 0) {
            throw new Error("No ref to merge for revision");
        }

        this.status = "merged";
        this.tags.push("merged");
        this.patches.push(ref);

        await this.save(parentIds);
    }
}

module.exports = Revision;
