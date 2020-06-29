"use strict";

const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { Type } = require("typelib");
const BackendProxy = require("../backend_proxy");
const Repository = require("./repository");

const ReviewState = {
    APPROVED: "approved",
    REJECTED: "rejected",
    NEUTRAL: "neutral"
};

const REVISION_STATUS = {
    SUBMITTED: "submitted",
    MERGED: "merged",
    ABANDONED: "abandoned"
};

class Revision extends Type {
    constructor(data) {
        super();

        this.repository = false;
        this.status = REVISION_STATUS.SUBMITTED;
        this.statusSetAt = new Date();
        this.patches = [];
        this.reviews = [];
        this.verified = ReviewState.NEUTRAL;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "revision";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async allocate(repoId, id, patch, initialTags = []) {
        let revision = await this.findOne({ _id: id });

        if (!revision) {
            revision = new Revision({
                _id: id,
                repository: repoId,
                tags: initialTags.slice()
            });
        }

        const query = { email: patch.email };
        patch.userRef = await revision.getUserRef(query);
        revision.patches.push(patch);

        // If we get a new patch we should restart the flow and thus need
        // to remove all tags set by steps.
        await revision.clearTags("step:", initialTags, false);

        await revision.save();

        return revision;
    }

    async merge() {
        if (this.status === REVISION_STATUS.MERGED) {
            throw new Error("Revision already merged");
        }

        if (this.patches.length === 0) {
            throw new Error("No patch to merge for revision");
        }

        const repository = await Repository.findOne({ _id: this.repository });
        // TODO: Any asynchronous updates done by backend isn't updated in this
        const patch = await BackendProxy.instance.merge(repository, this);

        if (patch) {
            // Some backends calls setMerged by them self...
            await this.setMerged(patch);
        }
    }

    async setMerged(patch = null) {
        if (this.status === REVISION_STATUS.MERGED) {
            throw new Error("Revision already merged");
        }

        if (this.patches.length === 0) {
            throw new Error("No patch to merge for revision");
        }

        this.status = REVISION_STATUS.MERGED;
        this.statusSetAt = new Date();
        this.tags.push(REVISION_STATUS.MERGED);

        if (patch) {
            const query = { email: patch.email };
            patch.userRef = await this.getUserRef(query);
            this.patches.push(patch);
        }

        await this.save();
    }

    async setAbandoned() {
        if (this.status === REVISION_STATUS.ABANDONED) {
            throw new Error("Revision already abandoned");
        }

        this.status = REVISION_STATUS.ABANDONED;
        this.statusSetAt = new Date();
        this.tags.push(REVISION_STATUS.ABANDONED);
        await this.save();
    }

    async skipReview() {
        await this.clearTags("review:", [], false);
        this.tags.push("review:skip");
        await this.save();
    }

    async clearReviews() {
        this.reviews.length = 0;
        await this.clearTags("review:", [], false);
        await this.save();
    }

    // userRef if existing, otherwise use alias
    async addReview(userRef, alias, state) {
        if (!userRef && !alias) {
            throw new Error("userRef or alias expected");
        }

        // Modify previous review for user
        const review = this.reviews.find(
            (r) => (userRef && r.userRef) ? r.userRef.id === userRef.id : r.alias === alias
        );

        const time = new Date();
        if (review) {
            review.state = state;
            review.updated = time;
        } else {
            this.reviews.push({
                created: time,
                updated: time,
                userRef,
                alias,
                state
            });
        }

        // Clear and regenerate review tags
        await this.clearTags("review:", [], false);
        const reviewTags = [];
        let approvecount = 0;
        let rejectcount = 0;

        this.reviews.forEach((review) => {
            if (review.state === ReviewState.APPROVED) {
                approvecount++;
                reviewTags.push(`review:approved:${approvecount}`);
            } else if (review.state === ReviewState.REJECTED) {
                rejectcount++;
                reviewTags.push(`review:rejected:${rejectcount}`);
            }
        });

        this.tag(reviewTags);
        await this.save();
    }

    async updateVerified(state) {
        const repository = await Repository.findOne({ _id: this.repository });
        // TODO: Any asynchronous updates done by backend isn't updated in this
        await BackendProxy.instance.setVerified(repository, this, state);
    }

    async setVerified(state) {
        if (!Object.values(ReviewState).includes(state)) {
            throw new Error(`Invalid verified state: ${state}`);
        }

        // Clear and regenerate verified tag
        await this.clearTags("verify:", [], false);
        if (state !== ReviewState.NEUTRAL) {
            this.tags.push(`verify:${state}`);
        }

        this.verified = state;
        await this.save();
    }

    async getUserRef(query) {
        let ref = false;

        if (!query || typeof query !== "object") {
            ServiceMgr.instance.log("error", `Invalid user matching query '${query}' (expected query object)`);

            return false;
        }

        try {
            const client = ServiceComBus.instance.getClient("userrepo");
            const users = await client.list("user", query);

            if (!(users instanceof Array)) {
                throw new Error(`Expected array result, got data: ${JSON.stringify(users)}`);
            }
            if (users.length === 1) {
                ref = {
                    id: users[0]._id,
                    type: "userrepo.user",
                    _ref: true
                };
            } else if (users.length === 0) {
                ServiceMgr.instance.log("info", `Found no user matching query '${JSON.stringify(query)}'`);
            } else {
                ServiceMgr.instance.log("error", `Found ${users.length} users matching query '${JSON.stringify(query)}'`);
            }
        } catch (error) {
            ServiceMgr.instance.log("error", `Error while finding user matching query '${JSON.stringify(query)}'`, error);
        }

        return ref;
    }
}

module.exports = Revision;
module.exports.ReviewState = ReviewState;
