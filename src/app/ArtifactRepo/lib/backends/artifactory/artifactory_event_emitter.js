"use strict";

const { ServiceMgr } = require("service");
const { AsyncEventEmitter } = require("emitter");

class ArtifactoryEventEmitter extends AsyncEventEmitter {
    constructor(com, repoId, pollIntervalMs, newestKnownArtifactEpochMs) {
        super();
        this.com = com;
        this.repoId = repoId;
        this.pollIntervalMs = pollIntervalMs;
        this.newestKnownArtifactEpochMs = newestKnownArtifactEpochMs;
    }

    async start(doInitialPoll = true) {
        if (doInitialPoll) {
            await this._poll();
        }
        await this._startPoll();
    }

    async _startPoll() {
        if (this.pollIntervalMs > 0) {
            this._pollHandle = setInterval(
                () => this._poll(),
                this.pollIntervalMs
            );
        }
    }

    _stopPoll() {
        if (this._pollHandle) {
            clearInterval(this._pollHandle);
        }
        this._pollHandle = null;
    }

    /**
     * Poll for new artifacts using artifactory
     * REST API Artifacts Created in Date Range:
     * https://www.jfrog.com/confluence/display/RTF/Artifactory+REST+API#ArtifactoryRESTAPI-ArtifactsCreatedinDateRange
     * @return {undefined}
     */
    async _poll() {
        try {
            const res = await this.com.request(
                "artifactory/api/search/creation", {
                    qs: {
                        from: this.newestKnownArtifactEpochMs,
                        repos: this.repoId
                    },
                    json: true
                },
                "verbose"
            );
            if (res.results.length > 0) {
                // Sort by creation date, oldest first
                res.results.sort((a, b) => new Date(a.created).valueOf() - new Date(b.created).valueOf());
                for (const artifactInfo of res.results) {
                    await this.emit("new-artifact", artifactInfo);
                }
                // Update so next poll will search from most recent (last item)
                this.newestKnownArtifactEpochMs = new Date(res.results[res.results.length - 1].created).valueOf();
            }
        } catch (error) {
            if (error.statusCode === 404 &&
                error.error &&
                error.error.errors &&
                error.error.errors.length > 0 &&
                error.error.errors[0].message === "No results found.") {
                // OK with zero results
            } else {
                ServiceMgr.instance.log("error", "Artifactory poll failed with error", error);
            }
        }
    }

    async dispose() {
        this._stopPoll();
        this.removeAllListeners();
    }
}

module.exports = ArtifactoryEventEmitter;
