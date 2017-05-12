"use strict";

const { ServiceMgr } = require("service");
// const { ServiceComBus } = require("servicecom");
const rp = require("request-promise");
const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GitLabEventEmitter = require("./gitlab_event_emitter");

/*
To get started with GitLab:
NOTE: Webhook endpoint needs to be up or we hang? Needs testing
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

    async _createWebHook(repository, projectId) {
        ServiceMgr.instance.log("verbose", `Creating GitLab webhooks in project '${repository._id}'`);
        const url = `${this.apiBaseUrl}/projects/${projectId}/hooks`;
        console.log(url);
        const data = {
            "url": this.backend.webhookURL,
            "push_events": true,
            "merge_requests_events": true,
            "note_events": true
        };

        await this._sendRequest(url, data, "POST");
    }

    async _onPush(event) {
        ServiceMgr.instance.log("verbose", "push received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        // TODO: List of special branches
        if (event.ref !== "refs/heads/master") {
            ServiceMgr.instance.log("verbose", `Ignored push to personal branch ${event.ref}`);

            return;
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
                    oldrev: null, // TODO: set this
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

    async remove(repository) {
        ServiceMgr.instance.log("verbose", `Deleting GitLab repo ${repository._id}`);
        const project = await this._getProject(this.groupId, repository._id);
        if (!project || !project.id) {
            throw Error(`Could not resolve id for GitLab project ${repository._id}`);
        }

        try {
            console.log(project);
            const url = `${this.apiBaseUrl}/projects/${project.id}`;
            await this._sendRequest(url, {}, "DELETE");
        } catch (err) {
            ServiceMgr.instance.log("verbose", `Error deleting GitLab project ${repository._id}: ${err.message}`);
        }
    }

    async dispose() {
        this.removeAllListeners();
        this.GitLabEmitter.removeAllListeners();
        await this.GitLabEmitter.dispose();
    }
}

module.exports = GitLabBackend;
