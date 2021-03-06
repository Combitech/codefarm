"use strict";

const { ServiceMgr } = require("service");
// const { ServiceComBus } = require("servicecom");
const rp = require("request-promise");
const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GitLabEventEmitter = require("./gitlab_event_emitter");

/*
To get started with GitLab:
NOTE: Webhook might resend event if not enough time to process, set high enough
// TODO: fill in
*/

class GitLabBackend extends AsyncEventEmitter {
    constructor(id, backend, Repository, Revision) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
        this.Repository = Repository;
        this.Revision = Revision;
        this.baseUrl = this.backend.serverUrl;
        this.apiBaseUrl = `${this.baseUrl}/api/v4`;
        this.gitLabEmitter = new GitLabEventEmitter(
            ServiceMgr.instance.log.bind(ServiceMgr.instance)
        );
    }

    async start() {
        // Resolve group id, needed for create repo operations etc...
        const result = await this._getGroup(this.backend.target);
        if (!result) {
            throw Error(`Unable to retrieve group id for group '${this.backend.target}'`);
        }
        this.groupId = result.id;
        ServiceMgr.instance.log("verbose", `GitLab group '${this.backend.target}' has id: ${this.groupId}`);

        // Start event monitoring towards GitLab
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup GitLab webhook server: ${err}`);
        }
    }

    async _startMonitorEventStream() {
        this.gitLabEmitter.addListener("push", this._onPush.bind(this));
        this.gitLabEmitter.addListener("merge_request_opened", this._onMergeRequestUpdate.bind(this));
        this.gitLabEmitter.addListener("merge_request_updated", this._onMergeRequestUpdate.bind(this));
        this.gitLabEmitter.addListener("merge_request_closed", this._onMergeRequestClose.bind(this));

        return await this.gitLabEmitter.start(this.backend.port);
    }

    async _sendRequest(uri, body = {}, method = "POST") {
        const options = {
            method: method,
            uri: uri,
            headers: {
                "User-Agent": "Code Farm",
                "PRIVATE-TOKEN": this.backend.authToken
            },
            body: body,
            json: true // Automatically stringifies the body to JSON
        };

        return rp(options);
    }

    async _getGroup(name) {
        const url = `${this.apiBaseUrl}/groups`;
        const groups = await this._sendRequest(url, {}, "GET");
        for (const group of groups) {
            if (group.name && group.name === name) {
                return group;
            }
        }

        return null;
    }

    async _getProject(groupId, name) {
        const url = `${this.apiBaseUrl}/groups/${groupId}/projects`;
        const projects = await this._sendRequest(url, {}, "GET");
        for (const project of projects) {
            if (project.name && project.name === name) {
                return project;
            }
        }

        return null;
    }

    async _getRevision(revisionId) {
        const repository = await this.Revision.findOne({ _id: revisionId });
        if (!repository) {
            throw Error(`Unknown revision ${revisionId}`);
        }

        return repository;
    }

    async _createWebHook(repository, projectId) {
        ServiceMgr.instance.log("verbose", `Creating GitLab webhooks in project '${repository._id}'`);
        const url = `${this.apiBaseUrl}/projects/${projectId}/hooks`;
        const data = {
            "url": this.backend.webhookURL,
            "push_events": true,
            "merge_requests_events": true,
            "note_events": true,
            "token": this.backend.webhookSecret
        };

        await this._sendRequest(url, data, "POST");
    }

    // TODO: Solve problem with repeating webhook due to webhook time out
    async _onPush(event) {
        ServiceMgr.instance.log("verbose", "push received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        // TODO: List of special branches
        if (event.ref !== "refs/heads/master") {
            ServiceMgr.instance.log("verbose", `Ignored push to personal branch ${event.ref}`);

            return;
        }

        // Check the latest merged merge-requests to see if we should ignore this one
        const url = `${this.apiBaseUrl}/projects/${event.project_id}/merge_requests`;
        const merged = await this._sendRequest(url, { state: "merged" }, "GET");
        for (const m of merged) {
            if (m.merge_commit_sha === event.after) {
                ServiceMgr.instance.log("verbose", "Ignored push initiated by merging of merge request");

                return;
            }
        }

        const repository = await this._getRepo(event.project.name);

        for (const commit of event.commits) {
            const commitUrl = commit.url;
            const files = commit.added.map((filename) => ({
                name: filename,
                status: "added",
                url: commitUrl,
                download: ""
            }));

            files.push(...commit.modified.map((filename) => ({
                name: filename,
                status: "modified",
                url: commitUrl,
                download: ""
            })));

            files.push(...commit.removed.map((filename) => ({
                name: filename,
                status: "removed",
                url: commitUrl,
                download: ""
            })));

            const patch = {
                email: commit.author.email,
                name: commit.author.name,
                submitted: moment(commit.timestamp).utc().format(),
                comment: commit.message,
                pullreqnr: "-1",
                change: {
                    oldrev: event.before, // TODO: previous commit?
                    newrev: commit.id,
                    refname: event.ref,
                    commitUrl,
                    reviewUrl: "",
                    files
                }
            };

            const revision = await this.Revision.allocate(
                repository._id,
                commit.id,
                patch,
                repository.initialRevisionTags
            );
            revision.setMerged();
        }
        ServiceMgr.instance.log("verbose", `Merged ${event.commits.length} commits to ${repository._id}`);
    }

    async _onMergeRequestUpdate(event) {
        const action = event.object_attributes.action === "open" ? "opened" : "updated";
        ServiceMgr.instance.log("verbose", `merge_request_${action} received`);
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        const repository = await this._getRepo(event.repository.name);
        const patch = await this._createPatch(event, repository._id);

        // This will create a new revision or patch on existing revision
        const revision = await this.Revision.allocate(
            repository._id,
            event.object_attributes.id.toString(),
            patch,
            repository.initialRevisionTags
        );

        if (event.object_attributes.last_commit.message.indexOf("SKIP_REVIEW") !== -1) {
            await revision.skipReview();
        } else {
            // Will also clear review tags
            await revision.clearReviews();
        }
    }

    async _onMergeRequestClose(event) {
        ServiceMgr.instance.log("verbose", "merge-request-closed received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        const repository = await this._getRepo(event.repository.name);
        const revision = await this._getRevision(event.object_attributes.id.toString());

        if (event.object_attributes.state === "merged") {
            const mergeSha = event.object_attributes.merge_commit_sha;

            // Will create a new patch on existing revision, Override pull request SHA
            const patch = await this._createPatch(event, repository._id, mergeSha);
            ServiceMgr.instance.log("verbose", `GitLab merge request  ${event.object_attributes.id} merged`);

            return await revision.setMerged(patch);
        }

        ServiceMgr.instance.log("verbose", `GitLab merge request  ${event.object_attributes.id} abandoned`);

        return await revision.setAbandoned();
    }

    async _createPatch(event, repository, overrideSha = null) {
        const changeSha = overrideSha ? overrideSha : event.object_attributes.last_commit.id;
        ServiceMgr.instance.log("verbose", `Creating new patch for merge request ${event.object_attributes.id} (${changeSha})`);

        const files = [];

        return {
            email: event.object_attributes.last_commit.author.email,
            name: event.object_attributes.last_commit.author.name,
            submitted: moment.utc().format(),
            comment: event.object_attributes.title,
            pullreqnr: event.object_attributes.id.toString(),
            change: {
                oldrev: event.object_attributes.oldrev,
                newrev: changeSha,
                refname: event.object_attributes.source_branch,
                commitUrl: event.object_attributes.last_commit.url,
                reviewUrl: event.object_attributes.url,
                files
            }
        };
    }

    async _getRepo(repositoryName) {
        const repository = await this.Repository.findOne({ _id: repositoryName });
        if (!repository) {
            throw Error(`Unknown repository ${repositoryName}`);
        }

        return repository;
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate gerrit specific options
    }

    async create(repository) {
        ServiceMgr.instance.log("verbose", `Creating GitLab project '${repository._id}' in group '${this.backend.target}'`);
        const data = {
            name: repository._id,
            namespace_id: this.groupId, // eslint-disable-line camelcase
            visibility: "private"
        };

        const url = `${this.apiBaseUrl}/projects`;
        let projectId = false;
        try {
            const result = await this._sendRequest(url, data, "POST");
            projectId = result.id;
        } catch (err) {
            if (err.name === "StatusCodeError" && err.statusCode === 400 &&
                err.error.message.name[0] === "has already been taken") {
                ServiceMgr.instance.log("verbose", `Connecting to existing GitLab project '${repository._id}'`);
            } else {
                throw Error(`Error creating GitLab project '${repository._id}' error: ${err.message}`);
            }
        }

        try {
            // TODO: Check if hooks already exist?
            await this._createWebHook(repository, projectId);
        } catch (err) {
            throw Error(`Error creating webhook for GitLab project '${repository._id}' error: ${err.message}`);
        }

        ServiceMgr.instance.log("verbose", `Created GitLab project '${repository._id}' in group '${this.backend.target}' and set up webhooks`);
    }

    async merge(/* repository, revision */) {
        throw Error("Not implemented");
    }

    async getUri(backend, repository) {
        return `${this.baseUrl}/${this.backend.target}/${repository._id}.git`;
    }


    async update(/* repository */) {
        // TODO: Implement update
        throw Error("Not implemented");
    }

    async setVerified(/* repository, revision */) {
        // TODO: Implement setVerified
        throw Error("Not implemented");
    }

    async remove(repository) {
        ServiceMgr.instance.log("verbose", `Deleting GitLab repo ${repository._id}`);
        const project = await this._getProject(this.groupId, repository._id);
        if (!project || !project.id) {
            throw Error(`Could not resolve id for GitLab project ${repository._id}`);
        }

        try {
            const url = `${this.apiBaseUrl}/projects/${project.id}`;
            await this._sendRequest(url, {}, "DELETE");
        } catch (err) {
            ServiceMgr.instance.log("verbose", `Error deleting GitLab project ${repository._id}: ${err.message}`);
        }
    }

    async dispose() {
        this.removeAllListeners();
        this.gitLabEmitter.removeAllListeners();
        await this.gitLabEmitter.dispose();
    }
}

module.exports = GitLabBackend;
