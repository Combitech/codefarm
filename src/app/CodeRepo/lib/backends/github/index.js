"use strict";

const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const rp = require("request-promise");
const moment = require("moment");
const { AsyncEventEmitter } = require("emitter");
const GithubEventEmitter = require("./github_event_emitter");

/*
To get started with github:
1. Create a new user to use as integrator for the user/organization.
2. Setup a personal token for that user in GitHub 'Settings'
2.1 Make sure the 'repo' and 'admin:repo_hook' categories are checked
2.2 If you want to be able to delete repositories also check 'delete_repo'
3. Create the backend in the UI, provide the token and other data

Creating a new GitHub backend:
1. As the GitHub backend makes use of webhooks for events, a unique local port
   needs to be reachable from the github server for every started GitHub
   backend, alternatively port forwarding set up.
2. Use the UI to create the new repository, with:
   * target <- either a username or organization name
   * isOrganization <- flag to indicate if target is organization
   * authUser <- username previously created as integrator
   * authToken <- token previously created in integrator account
   * webHookUrl <- reachable HTTPS URL for webhook events from GitHub servers
   * port <- local port which will host a webserver listening to webhook events
3. Under repository settings, only allow merge squash under "Merge button"

Example configuration:
    target -> "Combitech"
    isOrganization -> true
    authUser -> "ebbqeadm"
    authToken -> "faded42f502fbad3d88034751d9c847552d3b9b4"
    webHookURL -> "https://secor.runge.se"
    port -> 3000

    The above will create a GitHub backend with new repositories created in
    the Combitech organization space. Operations will be authenticated as
    "ebbqeadm" and use the provided token. Webhooks will be set up so that
    events are sent to "https://secor.runge.se" and a web server started
    locally on port 3000 listening for these events. In the above example
    we have also previously set up port forwarding from secor.runge.se to
    the local machine.
*/

class GithubBackend extends AsyncEventEmitter {
    constructor(id, backend, Repository, Revision, backendsConfig) {
        super();
        this.id = id;
        this.backend = backend;
        this.locks = {};
        this.Repository = Repository;
        this.Revision = Revision;
        this.baseUrl = backendsConfig.github.baseUrl;
        this.apiBaseUrl = backendsConfig.github.apiBaseUrl;
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

    async _getRepo(repositoryName) {
        const repository = await this.Repository.findOne({ _id: repositoryName });
        if (!repository) {
            throw Error(`Unknown repository ${repositoryName}`);
        }

        return repository;
    }

    async _getRevision(revisionId) {
        const repository = await this.Revision.findOne({ _id: revisionId });
        if (!repository) {
            throw Error(`Unknown revision ${revisionId}`);
        }

        return repository;
    }

    async _createPatch(event, repository, overrideSha = null) {
        const changeSha = overrideSha ? overrideSha : event.pull_request.head.sha;
        const commit = await this._getCommit(event.repository.name, changeSha);
        const name = commit ? commit.commit.author.name : event.pull_request.user.login;

        ServiceMgr.instance.log("verbose", `Creating new patch for pull request ${event.pull_request.number} (${changeSha})`);

        return {
            email: commit ? commit.commit.author.email : false,
            name: name,
            submitted: moment.utc().format(),
            comment: event.pull_request.title,
            pullreqnr: event.pull_request.number.toString(),
            change: {
                oldrev: event.pull_request.base.sha,
                newrev: changeSha,
                refname: event.pull_request.head.ref,
                files: commit ? commit.files.map((file) => ({
                    name: file.filename,
                    status: file.status,
                    url: file.blob_url,
                    download: file.raw_url
                })) : []
            }
        };
    }

    // Lookup user based on github alias
    async _getUserByGithubLogin(githubUserName) {
        let ref = false;

        if (typeof githubUserName !== "string" || githubUserName.length === 0) {
            ServiceMgr.instance.log("error", `Expected name as non-zero length string but got '${githubUserName}'`);

            return false;
        }

        try {
            const client = ServiceComBus.instance.getClient("userrepo");
            const users = await client.list("user", { "aliases.github": githubUserName });

            if (users.length === 0) {
                ServiceMgr.instance.log("info", `Found no user with github alias '${githubUserName}'`);

                return false;
            } else if (users.length > 1) {
                ServiceMgr.instance.log("error", `Found ${users.length} users with github alias '${githubUserName}'`);

                return false;
            }

            ref = {
                id: users[0]._id,
                email: users[0].email[0],
                type: "userrepo.user",
                _ref: true
            };
        } catch (error) {
            ServiceMgr.instance.log("error", `Can't get user ref for user with github alias '${githubUserName}'`, error);
        }

        return ref;
    }

    async _getCommit(repositoryName, commitSha) {
        const url = `${this.apiBaseUrl}/repos/${this.backend.target}/${repositoryName}/commits/${commitSha}`;
        try {
            return await this._sendRequest(url, {}, "GET");
        } catch (err) {
            ServiceMgr.instance.log("info", `Unable to get commit for ${repositoryName}:${commitSha}`);

            return null;
        }
    }

    async _getPullRequestMergeSha(repositoryName, pullReqNumber) {
        const uri = `${this.apiBaseUrl}/repos/${this.backend.target}/${repositoryName}/issues/${pullReqNumber}/events`;
        try {
            const events = await this._sendRequest(uri, {}, "GET");
            for (const event of events) {
                if (event.event === "merged") {
                    return event.commit_id;
                }
            }
        } catch (err) {
            ServiceMgr.instance.log("error", `Failed to get merge SHA for repo ${repositoryName} pull request ${pullReqNumber}: ${err}`);

            return null;
        }
    }

    async _onPing(event) {
        ServiceMgr.instance.log("verbose", "ping event received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
    }

    // This will handle both pull request open and update
    async _onPullRequestUpdate(event) {
        const action = event.action === "opened" ? "open" : "update";
        ServiceMgr.instance.log("verbose", `pull_request_${action} received`);
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        const repository = await this._getRepo(event.repository.name);
        const patch = await this._createPatch(event, repository._id);

        // This will create a new revision or patch on existing revision
        const revision = await this.Revision.allocate(repository._id, event.pull_request.id.toString(), patch);

        // Check if title contains SKIP_REVIEW and if so set the review:skip tag
        const commit = await this._getCommit(event.repository.name, event.pull_request.head.sha);
        if (commit.commit.message.indexOf("SKIP_REVIEW") !== -1) {
            await revision.skipReview();
        } else {
            // Will also clear review tags
            await revision.clearReviews();
        }
    }

    async _onPullRequestClose(event) {
        ServiceMgr.instance.log("verbose", "pull-request-closed received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        const repository = await this._getRepo(event.repository.name);
        const revision = await this._getRevision(event.pull_request.id.toString());

        if (event.pull_request.merged === true) {
            const mergeSha = await this._getPullRequestMergeSha(event.repository.name, event.pull_request.number);

            // Will create a new patch on existing revision, Override pull request SHA
            const patch = await this._createPatch(event, repository._id, mergeSha);
            ServiceMgr.instance.log("verbose", `GitHub pull request  ${event.pull_request.number} merged`);

            return await revision.setMerged(patch);
        }

        return await revision.setAbandoned();
    }

    async _onPush(event) {
        ServiceMgr.instance.log("verbose", "push received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));

        const pullreqrev = await this.Revision.findOne({ "patches.change.newrev": event.head_commit.id });
        if (pullreqrev) {
            ServiceMgr.instance.log("verbose", "Ignored push initiated by pull request merge");

            return;
        }

        // TODO: List of special branches
        if (event.ref !== "refs/heads/master") {
            ServiceMgr.instance.log("verbose", `Ignored push to personal branch ${event.ref}`);

            return;
        }

        const repository = await this._getRepo(event.repository.name);
        let revision = null;
        for (const commit of event.commits) {
            const info = await this._getCommit(event.repository.name, commit.id);

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
                    files: info ? info.files.map((file) => ({
                        name: file.filename,
                        status: file.status,
                        url: file.blob_url,
                        download: file.raw_url
                    })) : []
                }
            };

            revision = await this.Revision.allocate(repository._id, commit.id, patch);
            revision.setMerged();
        }
        ServiceMgr.instance.log("verbose", `Merged ${event.commits.length} commits to ${repository._id}`);
    }

    async _onPullRequestReview(event) {
        ServiceMgr.instance.log("verbose", "pull_request_review received");
        ServiceMgr.instance.log("debug", JSON.stringify(event, null, 2));
        ServiceMgr.instance.log("verbose", `Review ${event.review.state} for ${event.pull_request.id}`);

        const revision = await this._getRevision(event.pull_request.id.toString());
        const query = { "aliases.github": event.review.user.login };
        const alias = event.review.user.login;
        const userRef = await revision.getUserRef(query);

        if (!userRef) {
            ServiceMgr.instance.log("info", `Failed to resolve reviewer github login '${alias}' to user`);
        } else {
            ServiceMgr.instance.log("verbose", `Reviewer github login '${alias}' resolved to user '${userRef.id}'`);
        }

        const state = event.review.state;
        if (state === "commented") {
            await revision.addReview(userRef, alias, this.Revision.ReviewState.NEUTRAL);
        } else if (state === "changes_requested") {
            await revision.addReview(userRef, alias, this.Revision.ReviewState.REJECTED);
        } else if (state === "approved") {
            await revision.addReview(userRef, alias, this.Revision.ReviewState.APPROVED);
        } else {
            ServiceMgr.instance.log("verbose", `unknown review state ${state} on ${revision._id}`);
        }
    }

    async _startMonitorEventStream() {
        this.githubEmitter.addListener("ping", this._onPing.bind(this));
        this.githubEmitter.addListener("pull_request_opened", this._onPullRequestUpdate.bind(this));
        this.githubEmitter.addListener("pull_request_updated", this._onPullRequestUpdate.bind(this));
        this.githubEmitter.addListener("pull_request_closed", this._onPullRequestClose.bind(this));
        this.githubEmitter.addListener("pull_request_review", this._onPullRequestReview.bind(this));
        this.githubEmitter.addListener("push", this._onPush.bind(this));

        return await this.githubEmitter.start(this.backend.port);
    }

    async _createWebHook(repository) {
        ServiceMgr.instance.log("verbose", `Creating GitHub webhooks on ${repository._id}`);
        const uri = `${this.apiBaseUrl}/repos/${this.backend.target}/${repository._id}/hooks`;
        const data = {
            "name": "web",
            "active": true,
            "events": [ "pull_request", "pull_request_review", "push" ],
            "config": {
                "url": this.backend.webhookURL,
                "content_type": "json"
            }
        };

        await this._sendRequest(uri, data);
    }

    async _sendRequest(uri, body, method = "POST") {
        const auth = Buffer.from(`${this.backend.authUser}:${this.backend.authToken}`).toString("base64");
        const options = {
            method: method,
            uri: uri,
            headers: {
                "User-Agent": "Code Farm",
                "Authorization": `Basic ${auth}`,
                // TODO remove this once merge_method is no longer experimental
                "Accept": "application/vnd.github.polaris-preview"
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
            uri = `${this.apiBaseUrl}/orgs/${this.backend.target}/repos`;
        } else {
            uri = `${this.apiBaseUrl}/user/repos`;
        }
        const data = {
            "name": repository._id,
            "auto_init": true
        };

        try {
            await this._sendRequest(uri, data);
        } catch (err) {
            // Handle repo exist error and connect to repo instead
            if (err.name === "StatusCodeError" && err.statusCode === 422 &&
                err.error.errors[0].message === "name already exists on this account") {
                ServiceMgr.instance.log("verbose", `Connecting to existing GitHub repo ${repository._id}`);
            } else {
                ServiceMgr.instance.log("verbose", `Error creating GitHub repo ${repository._id}: ${err.message}`);
            }
        }

        try {
            await this._createWebHook(repository);
        } catch (err) {
            ServiceMgr.instance.log("verbose", `Error creating GitHub repo ${repository._id} webhook: ${err.message}`);
        }
    }

    async merge(repository, revision) {
        if (revision.status === "closed") {
            throw Error(`Will not merge closed revision ${revision._id}`);
        }

        const pullreqnr = revision.patches[revision.patches.length - 1].pullreqnr;
        ServiceMgr.instance.log("verbose", `GitHub merge pull request ${pullreqnr} in ${repository._id}`);
        const patch = revision.patches[revision.patches.length - 1];
        const uri = `${this.apiBaseUrl}/repos/${this.backend.target}/${repository._id}/pulls/${pullreqnr}/merge`;
        const data = {
            "sha": patch.change.newrev,
            "merge_method": "squash"
        };

        try {
            await this._sendRequest(uri, data, "PUT");
        } catch (err) {
            ServiceMgr.instance.log("error", `Error merging in repository: ${repository._id} sha: ${patch.change.newrev} err: ${err}`);
            throw Error(`GitHub merge failed with message: ${err.message}`);
        }

        // We set merged ourselves, we do not want it to be set in
        return null;
    }

    async getUri(backend, repository) {
        return `${this.baseUrl}/${this.backend.target}/${repository._id}.git`;
    }


    async update(/* repository */) {
        // TODO: Implement update
    }

    async remove(repository) {
        ServiceMgr.instance.log("verbose", `Deleting GitHub repo ${repository._id}`);
        try {
            await this._sendRequest(`${this.apiBaseUrl}/repos/${this.backend.target}/${repository._id}`, {}, "DELETE");
        } catch (err) {
            ServiceMgr.instance.log("verbose", `Error deleting GitHub repo ${repository._id}: ${err.message}`);
        }
    }

    async dispose() {
        this.removeAllListeners();
        this.githubEmitter.removeAllListeners();
        await this.githubEmitter.dispose();
    }
}

module.exports = GithubBackend;
