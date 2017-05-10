"use strict";

const { ServiceMgr } = require("service");
// const { ServiceComBus } = require("servicecom");
const rp = require("request-promise");
// const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GitLabEventEmitter = require("./gitlab_event_emitter");

/*
To get started with GitLab:
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
        return await this.gitLabEmitter.start(this.backend.port);
    }

    async _sendRequest(uri, body = {}, method = "GET") {
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
        const groups = await this._sendRequest(url);
        for (const group of groups) {
            if (group.name && group.name === name) {
                return group;
            }
        }

        return null;
    }

    async _getProject(groupId, name) {
        const url = `${this.apiBaseUrl}/groups/${groupId}/projects`;
        const projects = await this._sendRequest(url);
        for (const project of projects) {
            if (project.name && project.name === name) {
                return project;
            }
        }

        return null;
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate gerrit specific options
    }

    async create(repository) {
        ServiceMgr.instance.log("verbose", `Creating GitLab repo ${repository._id} in group ${this.backend.target}`);
        const data = {
            name: repository._id,
            namespace_id: this.groupId, // eslint-disable-line camelcase
            visibility: "private"
        };

        const url = `${this.apiBaseUrl}/projects`;
        try {
            await this._sendRequest(url, data, "POST");
        } catch (err) {
            if (err.name === "StatusCodeError" && err.statusCode === 400 &&
                err.error.message.name[0] === "has already been taken") {
                ServiceMgr.instance.log("verbose", `Connecting to existing GitLab project '${repository._id}'`);
            } else {
                ServiceMgr.instance.log("verbose", `Error creating GitLab project ${repository._id}: ${err.message}`);
            }
        }
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
