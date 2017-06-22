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

describe("GitlabBackend", async () => {
    let testInfo;
    let main;

    let restUrl;
    let webHookUrl;

    let addBackend;
    let addRepo;
    let deleteBackend;
    let deleteRepo;
    let getRevision;

    let sendToGitlabBackend;
    let createMergeRequest;
    let createChangeByMergeRequest;

    let assertRevision;
    let assertPatch;

    let glStub;

    before(async () => {
        const glStubPort = await getPort();
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
            name: "coderepo-gitlab",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "verbose",
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
                backendSearchPath: [],
                servicecom: {
                    testMode: true
                },
                backendsConfig: {
                }
            },
            gitLabBackend: {
                _id: "GitLabBackend2",
                backendType: "gitlab",
                port: await getPort(),
                target: "groupName1",
                serverUrl: `http://localhost:${glStubPort}`,
                authToken: "authToken123",
                webhookURL: "dummyUrl1",
                webhookSecret: "secret"
            },
            gitLabRepo: {
                _id: "GitLabRepo1",
                backend: "GitLabBackend2",
                initialRevisionTags: [ "belongsTo_GitLabRepo1" ]
            },
            userData: [
                { _id: "testuser" }
            ]
        };

        restUrl = `http://localhost:${testInfo.config.web.port}`;
        webHookUrl = `http://localhost:${testInfo.gitLabBackend.port}`;

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

        sendToGitlabBackend = async (ghType, data) => {
            const theHeader = {};
            theHeader["x-gitlab-event"] = ghType;

            return await rp.post({
                headers: theHeader,
                url: webHookUrl,
                body: data,
                json: true
            });
        };

        createMergeRequest = (action, prefix, reponame) => ({
            object_attributes: { // eslint-disable-line camelcase
                id: `${prefix}-123`,
                action,
                title: `Title for ${prefix}`,
                oldrev: `${prefix}-baseSha`,
                url: `${prefix}-reviewUrl`,
                last_commit: { // eslint-disable-line camelcase
                    message: `Commit message for ${prefix}`,
                    url: `${prefix}-headUrl`,
                    id: `${prefix}-headSha`,
                    author: {
                        name: `${prefix}-userlogin`,
                        email: `${prefix}@yoyo.yo`
                    }
                }
            },
            repository: {
                _id: "repositoryId",
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
        createChangeByMergeRequest = async (prefix, action = "open") => {
            const mergereq = createMergeRequest(action, prefix, testInfo.gitLabRepo._id);
            await sendToGitlabBackend("Merge Request Hook", mergereq);

            return await getRevision(`${prefix}-123`);
        };

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();

        // Set up response to user query from gitlab backend
        serviceComStub(ServiceComBus, "list", "user", "success", testInfo.userData);

        glStub = new RestStub();
        await glStub.start(glStubPort);

        // Backend upon start tries to resolve group id, need to setup response
        const data = [ { name: "groupName1", id: "groupId123" } ];
        glStub.addRequestResponse("GET", "/api/v4/groups", 200, data);
        const deferred = glStub.expect("GET", [ "/api/v4/groups" ]);

        await addBackend(testInfo.gitLabBackend);

        await deferred.promise;
        assert(deferred.resolved);
    });

    after(async () => {
        await deleteBackend(testInfo.gitLabBackend._id);
        ServiceMgr.instance.dispose();
    });

    afterEach(async () => {
        glStub.reset();
        glStub.removeAllListeners();
    });

    describe("GitLab repo", async () => {
        it("shall create a repository", async () => {
            glStub.addRequestResponse("POST", "/api/v4/projects", 200, { id: "12345" });
            const deferred = glStub.expect("POST", [ "/api/v4/projects", "/api/v4/projects/12345/hooks" ]);

            await addRepo(testInfo.gitLabRepo);

            await deferred.promise;
            assert(deferred.resolved);
        });

        it("shall create revision on direct push", async () => {
            glStub.addRequestResponse("GET", "/api/v4/projects/12345/merge_requests", 200, []);
            const deferred = glStub.expect("GET", [ "/api/v4/projects/12345/merge_requests" ]);

            const pushreq = {
                before: "beforeId",
                project_id: "12345", // eslint-disable-line camelcase
                project: {
                    name: "GitLabRepo1"
                },
                ref: "refs/heads/master",
                commits: [
                    {
                        url: "commit1Url",
                        added: [ "dummy.txt" ],
                        modified: [],
                        removed: [],
                        id: "commitId123",
                        message: "Commit message",
                        author: {
                            email: "yoyo@yoyo.se",
                            name: "yoyo"
                        }
                    }
                ]
            };

            await sendToGitlabBackend("Push Hook", pushreq);

            await deferred.promise;
            assert(deferred.resolved);

            const r = await getRevision("commitId123");
            assert(r.status === "merged");
            assert.deepEqual(r.tags, [ "belongsTo_GitLabRepo1", "merged" ]);
            assert(r.repository === "GitLabRepo1");
            assert(r.patches.length === 1);

            const p = r.patches[0];
            assert(p.email === "yoyo@yoyo.se");
            assert(p.name === "yoyo");
            assert(p.comment === "Commit message");
            assert(p.pullreqnr === "-1");
            assert(p.change.newrev === "commitId123");
            assert(p.userRef.id === "testuser");
            assert(p.userRef.type === "userrepo.user");
            assert(p.change.files.length === 1);
            const f = p.change.files[0];
            assert(f.name === "dummy.txt");
            assert(f.url === "commit1Url");
        });

        it("shall create revision on merge request open", async () => {
            const r = await createChangeByMergeRequest("pr1");
            assertRevision(r, "submitted", [ "belongsTo_GitLabRepo1" ], testInfo.gitLabRepo._id);
            assert(r.patches.length === 1);
            assertPatch(r.patches[0], testInfo.userData[0]._id, "pr1@yoyo.yo", "pr1");
        });

        it("shall create revision on merge request update", async () => {
            const r = await createChangeByMergeRequest("pr1", "update");
            assertRevision(r, "submitted", [ "belongsTo_GitLabRepo1" ], testInfo.gitLabRepo._id);
            assert(r.patches.length === 2);
            assertPatch(r.patches[1], testInfo.userData[0]._id, "pr1@yoyo.yo", "pr1");
        });

        it("shall set revision abandoned on merge request close without merge", async () => {
            const r = await createChangeByMergeRequest("pr1", "close");
            assertRevision(r, "abandoned", [ "belongsTo_GitLabRepo1", "abandoned" ], testInfo.gitLabRepo._id);
            assert(r.patches.length === 2);
            assertPatch(r.patches[1], testInfo.userData[0]._id, "pr1@yoyo.yo", "pr1");
        });

        it("shall set revision as merged on merge request close with merge", async () => {
            await createChangeByMergeRequest("pr2"); // Create basic revision

            // Create second pull request action with closed and merged
            const mergereq = createMergeRequest("close", "pr2", testInfo.gitLabRepo._id);
            mergereq.object_attributes.state = "merged";
            mergereq.object_attributes.merge_commit_sha = "pr2-mergeSha"; // eslint-disable-line camelcase

            await sendToGitlabBackend("Merge Request Hook", mergereq);

            const r = await getRevision("pr2-123");
            assertRevision(r, "merged", [ "belongsTo_GitLabRepo1", "merged" ], testInfo.gitLabRepo._id);
            assert(r.patches.length === 2);
            const p = r.patches[r.patches.length - 1];
            assert(p.change.newrev === "pr2-mergeSha"); // Last patch should have merge commit set
        });

        it("shall delete a repository", async () => {
            // Backend upon repo delete tries to resolve project id, need to setup response
            const data = [ { name: testInfo.gitLabRepo._id, id: "projectId123" } ];
            glStub.addRequestResponse("GET", "/api/v4/groups/groupId123/projects", 200, data);
            const deferred = glStub.expect("DELETE", [ "/api/v4/projects/projectId123" ]);

            await deleteRepo(testInfo.gitLabRepo._id);

            await deferred.promise;
            assert(deferred.resolved);
        });
    });
});
