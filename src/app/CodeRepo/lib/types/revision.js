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
        this.patches = [];
        this.reviews = [];

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

    static async allocate(repoId, id, patch) {
        let revision = await this.findOne({ _id: id });

        if (!revision) {
            revision = new Revision({
                _id: id,
                repository: repoId
            });
        }

        patch.userRef = await revision._getUserRef(patch.email);
        revision.patches.push(patch);

        // If we get a new patch we should restart the flow and thus need
        // to remove all tags set by steps.
        revision.tags = revision.tags.filter((tag) => !tag.startsWith("step:"));

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
        this.tags.push(REVISION_STATUS.MERGED);

        if (patch) {
            patch.userRef = await this._getUserRef(patch.email);
            this.patches.push(patch);
        }

        await this.save();
    }

    async setAbandoned() {
        if (this.status === REVISION_STATUS.ABANDONED) {
            throw new Error("Revision already abandoned");
        }

        this.status = REVISION_STATUS.ABANDONED;
        this.tags.push(REVISION_STATUS.ABANDONED);
        await this.save();
    }

    async addReview(userEmail, state) {
        const userRef = await this._getUserRef(userEmail);
        // Modify previous review for user
        const review = this.reviews.find(
            (r) => (userRef && r.userRef) ? r.userRef.id === userRef.id : r.userEmail === userEmail
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
                userEmail,
                state
            });
        }

        // Regenerate review tags
        this.tags = this.tags.filter((tag) => !tag.startsWith("review:"));
        let approvecount = 0;
        let rejectcount = 0;

        this.reviews.forEach((review) => {
            if (review.state === ReviewState.APPROVED) {
                this.tags.push(`review:approved:${approvecount}`);
                approvecount++;
            } else if (review.state === ReviewState.REJECTED) {
                this.tags.push(`review:rejected:${rejectcount}`);
                rejectcount++;
            }
        });

        await this.save();
    }

    async _getUserRef(userEmail) {
        let ref = false;

        if (typeof userEmail !== "string" ||
            (typeof userEmail === "string" && userEmail.length === 0)) {
            ServiceMgr.instance.log("error", `Can't get user ref for user with illegal email ${JSON.stringify(userEmail)}`);

            return ref;
        }

        try {
            const client = ServiceComBus.instance.getClient("userrepo");
            const users = await client.list("user", {
                email: userEmail
            });
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
                ServiceMgr.instance.log("info", `Found no user with email ${userEmail}`);
            } else {
                ServiceMgr.instance.log("error", `Found ${users.length} users with email ${userEmail}`);
            }
        } catch (error) {
            ServiceMgr.instance.log("error", `Can't get user ref for user with email ${userEmail}`, error);
        }

        return ref;
    }
}

module.exports = Revision;
module.exports.ReviewState = ReviewState;
