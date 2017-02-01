"use strict";

const log = require("log");
const rp = require("request-promise");
const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GithubEventEmitter = require("./github_event_emitter");

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_BASE = "https://github.com";

/*
To get started with github:
1. blalbabla
2. blalalalala
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
            await this._startMonitorEventStream();
        } catch (err) {
            log.error("Failed to setup local web server: ", err);
        }
    }

    async validateRepository(/* event, data */) {
        // TODO: Validate gerrit specific options
    }

    async _onPing(event) {
        console.log("ping event received");
    }

    async _onPullRequestOpen(event) {
        console.log("pull-request-open received");
        console.log(event);

        const changeId = event.pull_request.head.sha;
        const repositoryId = event.repository.name;
        const repository = await this.Repository.findOne({ _id: repositoryId });
        if (repository) {
            const ref = {
                index: 1,
                email: null,
                name: event.pull_request.user.login,
                submitted: moment.unix(event.pull_request.created_at).utc().format(),
                comment: event.pull_request.title,
                change: {
                    oldrev: null,
                    newrev: null,
                    refname: null // Use event.refName all the time instead?
                }
            };

            await this.Revision.allocate(repository._id, changeId, ref);
            log.info(`GitHub event allocated revision ${changeId}`);
        }
    }

    async _startMonitorEventStream() {
        this.githubEmitter.addListener("ping", this._onPing.bind(this));
        this.githubEmitter.addListener("pull-request-open", this._onPullRequestOpen.bind(this));
        await this.githubEmitter.start(this.backend.port);
    }

    async _createWebHook(repository) {
        console.log(`github create webhook ${repository._id}`);
        const uri = `${GITHUB_API_BASE}/repos/${this.backend.username}/${repository._id}/hooks`;
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

    async _sendRequest(uri, body, method = "POST") {
        const auth = Buffer.from(`${this.backend.username}:${this.backend.authToken}`).toString("base64");
        const options = {
            method: method,
            uri: uri,
            headers: {
                "User-Agent": "Code Farm",
                "Authorization": "Basic ".concat(auth)
            },
            body: body,
            json: true // Automatically stringifies the body to JSON
        };

        return rp(options);
    }

    async create(repository) {
        console.log(`github create repo ${repository._id}`);
        const uri = `${GITHUB_API_BASE}/user/repos`;
        const data = {
            "name": repository._id,
            "auto_init": true
        };

        await this._sendRequest(uri, data);
        await this._createWebHook(repository);
    }

    async merge(/* repository, revision */) {
//        log.info(`github merge ${revision._id} in repo ${repository._id}`);
    }

    async getUri(backend, repository) {
        return `${GITHUB_BASE}/${this.backend.username}/${repository._id}`;
    }


    async update(/* repository */) {
        // TODO: Implement update
    }

    async remove(repository) {
        console.log(`github delete repo ${repository._id}`);
        await this._sendRequest(`${GITHUB_API_BASE}/repos/${this.backend.username}/${repository._id}`, {}, "DELETE");
    }

    async dispose() {
        this.removeAllListeners();
        this.githubEmitter.removeAllListeners();
        await this.githubEmitter.dispose();
    }
}

module.exports = GithubBackend;
