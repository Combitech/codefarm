"use strict";

const { ServiceMgr } = require("service");
const rp = require("request-promise");
const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GithubEventEmitter = require("./github_event_emitter");

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_BASE = "https://github.com";

/*
To get started with github:
1. Create a new user to use as integrator
2. Setup a personal token for that user in GitHub 'Settings'
2.1 Make sure the 'repo' and 'admin:repo_hook' categories are checked
2.2 If you want to be able to delete repositories also check 'delete_repo'
3. Create the backend in the UI, provide the token and other data

Creating a new repository:
1. Use the UI to create the new repository
2. Under repository settings, only allow merge squash under "Merge button"

Connecting to an existing repository:
TODO: connecting to existing repo not yet supported
*/

class GithubBackend extends AsyncEventEmitter {
    constructor(id, backend, Repository, Revision) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
        this.Repository = Repository;
        this.Revision = Revision;

        this.githubEmitter = new GithubEventEmitter();
    }

    async start() {
        // Start event monitoring towards github
        try {
            const result = await this._startMonitorEventStream();
            ServiceMgr.instance.log("verbose", result);
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to setup GitHub webhook server: ${err}`);
        }
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate gerrit specific options
    }

    async _onPing(event) {
        ServiceMgr.instance.log("verbose", "ping event received");
        ServiceMgr.instance.log("debug", event);
    }

    _createRef(email, event) {
        return {
            index: 1,
            email: email,
            name: event.pull_request.user.login,
            submitted: moment.unix(event.pull_request.created_at).utc().format(),
            comment: event.pull_request.title,
            change: {
                oldrev: event.pull_request.base.sha,
                newrev: event.pull_request.head.sha,
                refname: event.pull_request.head.ref
            }
        };
    }

    async _createRevision(event) {
        const changeId = event.pull_request.id;
        const changeSha = event.pull_request.head.sha;
        const repositoryId = event.repository.name;
        const email = await this._getCommitAuthor(repositoryId, changeSha);
        const repository = await this.Repository.findOne({ _id: repositoryId });
        if (repository) {
            const ref = this._createRef(email, event);
            ServiceMgr.instance.log("debug", `Created revision ref ${ref}`);
            ServiceMgr.instance.log("verbose", `GitHub event allocating revision ${changeId}`);

            return await this.Revision.allocate(repository._id, changeId, ref);
        }
    }

    async _onPullRequestClosed(event) {
        ServiceMgr.instance.log("verbose", "pull-request-closed received");
        ServiceMgr.instance.log("debug", event);

        if (event.pull_request.merged === true) {
            const repositoryId = event.repository.name;
            const repository = await this.Repository.findOne({ _id: repositoryId });
            // Make sure that we know about repo
            if (repository) {
                // And that we know about revision...
                const changeId = event.pull_request.id;
                const revision = await this.Revision.findOne({ _id: changeId });
                if (revision) {
                    const changeSha = event.pull_request.head.sha;
                    const email = await this._getCommitAuthor(repositoryId, changeSha);
                    const ref = this._createRef(email, event);

                    await revision.setMerged(ref);
                    await this.emit("revision.merged", revision);
                    ServiceMgr.instance.log("info", `GitHub event merged revision ${changeId}`);
                }
            }
        }
    }

    async _onPullRequestUpdate(event) {
        ServiceMgr.instance.log("verbose", "pull-request-update received");
        ServiceMgr.instance.log("debug", event);
        await this._createRevision(event);
    }

    async _onPullRequestOpen(event) {
        ServiceMgr.instance.log("verbose", "pull-request-open received");
        ServiceMgr.instance.log("debug", event);
        await this._createRevision(event);
    }

    async _startMonitorEventStream() {
        this.githubEmitter.addListener("ping", this._onPing.bind(this));
        this.githubEmitter.addListener("pull-request-open", this._onPullRequestOpen.bind(this));
        this.githubEmitter.addListener("pull-request-update", this._onPullRequestUpdate.bind(this));
        this.githubEmitter.addListener("pull-request-closed", this._onPullRequestClosed.bind(this));

        return await this.githubEmitter.start(this.backend.port);
    }

    async _createWebHook(repository) {
        ServiceMgr.instance.log("verbose", `Creating GitHub webhooks on ${repository._id}`);
        const uri = `${GITHUB_API_BASE}/repos/${this.backend.target}/${repository._id}/hooks`;
        const data = {
            "name": "web",
            "active": true,
            "events": [ "pull_request" ],
            "config": {
                "url": this.backend.webhookURL,
                "content_type": "json"
            }
        };

        await this._sendRequest(uri, data);
    }

    async _getCommitAuthor(repository, commitSha) {
        const url = `${GITHUB_API_BASE}/repos/${this.backend.target}/${repository}/commits/${commitSha}`;
        console.log("Get commit author: ", url);
        try {
            const result = await this._sendRequest(url, {}, "GET");
            return result.commit.author.email;
        }
        catch (err) {
            ServiceMgr.instance.log("info", `Unable to get commit author for ${repository}:${commitSha}`);
            return null;
        }
    }

    async _sendRequest(uri, body, method = "POST") {
        const auth = Buffer.from(`${this.backend.authUser}:${this.backend.authToken}`).toString("base64");
        const options = {
            method: method,
            uri: uri,
            headers: {
                "User-Agent": "Code Farm",
                "Authorization": `Basic ${auth}`
            },
            body: body,
            json: true // Automatically stringifies the body to JSON
        };

        return rp(options);
    }

    async create(repository) {
        ServiceMgr.instance.log("verbose", `Creating GitHub repo ${repository._id}`);

        let uri;
        if (this.backend.isOrganization) {
            uri = `${GITHUB_API_BASE}/orgs/${this.backend.target}/repos`;
        }
        else {
            uri = `${GITHUB_API_BASE}/user/repos`;
        }
        const data = {
            "name": repository._id,
            "auto_init": true
        };

        await this._sendRequest(uri, data);
        await this._createWebHook(repository);
    }

    async merge(/* repository, revision */) {
        // TODO: implement this
        throw new Error("Not implemented");
//        ServiceMgr.instance.log("info", `github merge ${revision._id} in repo ${repository._id}`);
    }

    async getUri(backend, repository) {
        return `${GITHUB_BASE}/${this.backend.target}/${repository._id}`;
    }


    async update(/* repository */) {
        // TODO: Implement update
    }

    async remove(repository) {
        ServiceMgr.instance.log("verbose", `Deleting GitHub repo ${repository._id}`);
        await this._sendRequest(`${GITHUB_API_BASE}/repos/${this.backend.target}/${repository._id}`, {}, "DELETE");
    }

    async dispose() {
        this.removeAllListeners();
        this.githubEmitter.removeAllListeners();
        await this.githubEmitter.dispose();
    }
}

module.exports = GithubBackend;
