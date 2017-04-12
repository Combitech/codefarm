"use strict";

/* global describe it before after afterEach */

const { assert } = require("chai");
const getPort = require("get-port");
const { ServiceComBus } = require("servicecom");
const { mochaPatch, RestStub, serviceComStub } = require("testsupport");
const Main = require("../lib/main");
const rp = require("request-promise");
const { ServiceMgr } = require("service");

mochaPatch();

describe("GithubBackend", async () => {
    let testInfo;
    let main;

    let restUrl;
    let webHookUrl;

    let addBackend;
    let addRepo;
    let deleteBackend;
    let deleteRepo;
    let getRevision;

    let sendToGithubBackend;
    let createPullRequest;
    let createChangeByPullRequest;

    let assertRevision;
    let assertPatch;

    let ghStub;

    before(async () => {
        const ghStubPort = await getPort();
        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception", error);
            assert(false, `Uncaught exception, error: ${error.message}`);
        });
        process.on("unhandledRejection", (error, promise) => {
            console.error("Unhandled promise rejection", error);
            console.error("Promise", promise);
            assert(false, `Unhandled promise rejection, error: ${error.message}`);
        });
        testInfo = {
            name: "coderepo-github",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "info",
                web: {
                    port: await getPort()
                },
                db: {
                    testMode: true
                },
                bus: {
                    testMode: true
                },
                backends: {
                },
                servicecom: {
                    testMode: true
                },
                backendsConfig: {
                    github: {
                        baseUrl: `http://localhost:${ghStubPort}`,
                        apiBaseUrl: `http://localhost:${ghStubPort}`
                    },
                    gerrit: {
                        defaultPort: 29418,
                        defaultTimeoutMs: 10 * 1000
                    }
                }
            },
            gitHubBackend: {
                _id: "GitHubBackend2",
                backendType: "github",
                port: await getPort(),
                target: "dummyTarget1",
                isOrganization: true,
                authUser: "gitHubUser1",
                authToken: "gitHubUserToken1",
                webhookURL: "dummyUrl1"
            },
            gitHubRepo: {
                _id: "GitHubRepo1",
                backend: "GitHubBackend2",
                initialRevisionTags: [ "belongsTo_GitHubRepo1" ]
            },
            userData: [
                { _id: "testuser" }
            ]
        };

        restUrl = `http://localhost:${testInfo.config.web.port}`;
        webHookUrl = `http://localhost:${testInfo.gitHubBackend.port}`;

        addBackend = async (data) => rp.post({
            url: `${restUrl}/backend`,
            body: data,
            json: true
        });

        deleteBackend = async (name) => rp.delete({
            url: `${restUrl}/backend/${name}`
        });

        addRepo = async (data) => rp.post({
            url: `${restUrl}/repository`,
            body: data,
            json: true
        });

        getRevision = async (id) => rp.get({
            url: `${restUrl}/revision/${id}`,
            json: true
        });


        deleteRepo = async (name) => rp.delete({
            url: `${restUrl}/repository/${name}`
        });

        sendToGithubBackend = async (ghType, data) => {
            const theHeader = {};
            theHeader["x-github-event"] = ghType;

            return await rp.post({
                headers: theHeader,
                url: webHookUrl,
                body: data,
                json: true
            });
        };

        createPullRequest = (action, prefix, reponame) => ({
            action,
            pull_request: { // eslint-disable-line camelcase
                id: `${prefix}`,
                number: `${prefix}-123`,
                title: `Title for ${prefix}`,
                html_url: `${prefix}-html_url`, // eslint-disable-line camelcase
                merged: false,
                head: {
                    sha: `${prefix}-headSha`
                },
                base: {
                    sha: `${prefix}-baseSha`
                },
                user: {
                    login: `${prefix}-userlogin`,
                    email: `${prefix}@yoyo.yo`
                }
            },
            repository: {
                name: reponame
            }
        });

        assertRevision = (rev, status, tags, repository) => {
            assert(rev.status === status);
            assert(rev.tags.length === tags.length);
            assert(rev.tags.every((v, i) => v === tags[i]));
            assert(rev.repository === repository);
        };

        assertPatch = (p, user, email, prefix) => {
            assert(p.email === email);
            assert(p.name === `${prefix}-userlogin`);
            assert(p.comment === `Title for ${prefix}`);
            assert(p.pullreqnr === `${prefix}-123`);
            assert(p.change.newrev === `${prefix}-headSha`);
            assert(p.change.oldrev === `${prefix}-baseSha`);
            assert(p.userRef.id === user);
            assert(p.userRef.type === "userrepo.user");
            assert(p.change.files.length === 0);
        };

        // This creates a dummy pull request with given action and prefixes
        // all the different variables with prefix.
        createChangeByPullRequest = async (prefix, action = "opened") => {
            // Url that we expect will be GET'ed two times by github backend
            const expUrl = `/repos/dummyTarget1/GitHubRepo1/commits/${prefix}-headSha`;
            const deferred = ghStub.expect("GET", [ expUrl, expUrl ]); // url called twice
            const pullreq = createPullRequest(action, prefix, testInfo.gitHubRepo._id);

            await sendToGithubBackend("pull_request", pullreq);

            await deferred.promise;
            assert(deferred.resolved);

            return await getRevision(prefix);
        };

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();

        // Set up response to user query from github backend
        serviceComStub(ServiceComBus, "list", "user", "success", testInfo.userData);

        await addBackend(testInfo.gitHubBackend);

        ghStub = new RestStub();
        await ghStub.start(ghStubPort);
    });

    after(async () => {
        await deleteBackend(testInfo.gitHubBackend._id);
        ServiceMgr.instance.dispose();
    });

    afterEach(async () => {
        ghStub.reset();
        ghStub.removeAllListeners();
    });

    describe("GitHub repo", async () => {
        it("shall create a repository", async () => {
            const deferred = ghStub.expect("POST", [ "/orgs/dummyTarget1/repos", "/repos/dummyTarget1/GitHubRepo1/hooks" ]);

            await addRepo(testInfo.gitHubRepo);

            await deferred.promise;
            assert(deferred.resolved);
        });

        // TODO: Need to do changes in servicecom to have user resolved in this testcase
        it("shall create revision on direct push", async () => {
            const info = {
                html_url: "html_url", // eslint-disable-line camelcase
                files: [ { filename: "dummy.txt", status: "status", raw_url: "raw_url" } ] // eslint-disable-line camelcase
            };

            ghStub.addRequestResponse("GET", "/repos/dummyTarget1/GitHubRepo1/commits/12345", 200, info);
            const deferred = ghStub.expect("GET", [ "/repos/dummyTarget1/GitHubRepo1/commits/12345" ]);

            const pushreq = {
                ref: "refs/heads/master",
                commits: [
                    {
                        id: "12345",
                        message: "Commit message",
                        author: {
                            email: "yoyo@yoyo.se",
                            name: "yoyo"
                        }
                    }
                ],
                head_commit: { // eslint-disable-line camelcase
                    id: "12345"
                },
                repository: {
                    name: "GitHubRepo1"
                }
            };

            await sendToGithubBackend("push", pushreq);

            await deferred.promise;
            assert(deferred.resolved);

            const r = await getRevision("12345");
            assert(r.status === "merged");
            assert.deepEqual(r.tags, [ "belongsTo_GitHubRepo1", "merged" ]);
            assert(r.repository === "GitHubRepo1");
            assert(r.patches.length === 1);

            const p = r.patches[0];
            assert(p.email === "yoyo@yoyo.se");
            assert(p.name === "yoyo");
            assert(p.comment === "Commit message");
            assert(p.pullreqnr === "-1");
            assert(p.change.newrev === "12345");
            assert(p.userRef.id === "testuser");
            assert(p.userRef.type === "userrepo.user");
            assert(p.change.files.length === 1);
            const f = p.change.files[0];
            assert(f.name === "dummy.txt");
            assert(f.download === "raw_url");
        });

        it("shall create revision on pull-request open", async () => {
            const r = await createChangeByPullRequest("pr1");
            assertRevision(r, "submitted", [ "belongsTo_GitHubRepo1" ], testInfo.gitHubRepo._id);
            assert(r.patches.length === 1);
            assertPatch(r.patches[0], testInfo.userData[0]._id, false, "pr1");
        });

        it("shall create revision on pull-request update", async () => {
            const r = await createChangeByPullRequest("pr1", "synchronize");
            assertRevision(r, "submitted", [ "belongsTo_GitHubRepo1" ], testInfo.gitHubRepo._id);
            assert(r.patches.length === 2);
            assertPatch(r.patches[1], testInfo.userData[0]._id, false, "pr1");
        });

        it("shall set revision abandoned on pull-request close without merge", async () => {
            const pullreq = createPullRequest("closed", "pr1", testInfo.gitHubRepo._id);
            await sendToGithubBackend("pull_request", pullreq);
            const r = await getRevision("pr1");

            assertRevision(r, "abandoned", [ "belongsTo_GitHubRepo1", "abandoned" ], testInfo.gitHubRepo._id);
            assert(r.patches.length === 2);
            assertPatch(r.patches[1], testInfo.userData[0]._id, false, "pr1");
        });

        it("shall set revision as merged on pull-request close with merge", async () => {
            await createChangeByPullRequest("pr2"); // Create basic revision

            // Create second pull request action with closed and merged
            const pullreq = createPullRequest("closed", "pr2", testInfo.gitHubRepo._id);
            pullreq.pull_request.merged = true;


            const event = [ { event: "merged", commit_id: "pr2-mergeId" } ]; // eslint-disable-line camelcase
            ghStub.addRequestResponse("GET", "/repos/dummyTarget1/GitHubRepo1/issues/pr2-123/events", 200, event);
            // We expect a visit to pull request events and then the merge commit
            const deferred = ghStub.expect("GET", [ "/repos/dummyTarget1/GitHubRepo1/issues/pr2-123/events",
                "/repos/dummyTarget1/GitHubRepo1/commits/pr2-mergeId" ]);

            await sendToGithubBackend("pull_request", pullreq);

            await deferred.promise;
            assert(deferred.resolved);

            const r = await getRevision("pr2");
            assertRevision(r, "merged", [ "belongsTo_GitHubRepo1", "merged" ], testInfo.gitHubRepo._id);
            assert(r.patches.length === 2);
            const p = r.patches[r.patches.length - 1];
            assert(p.change.newrev === "pr2-mergeId"); // Last patch should have merge commit set
        });

        it("shall delete a repository", async () => {
            const deferred = ghStub.expect("DELETE", [ "/repos/dummyTarget1/GitHubRepo1" ]);
            await deleteRepo(testInfo.gitHubRepo._id);

            await deferred.promise;
            assert(deferred.resolved);
        });
    });
});
