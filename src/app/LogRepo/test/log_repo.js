"use strict";

/* global describe it before after */

const { assert } = require("chai");
const path = require("path");
const fs = require("fs-extra-promise");
const rp = require("request-promise");
const { mochaPatch } = require("testsupport");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

mochaPatch();

describe("LogRepo", () => {
    let testInfo;
    let main;
    let baseUrl;
    let reposDir;

    let addBackend;

    before(async () => {
        reposDir = await fs.mkdtempAsync(path.join(__dirname, "tmp-"));
        testInfo = {
            name: "logrepo",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "info",
                web: {
                    port: await getPort()
                },
                db: {
                    testMode: true,
                    name: "MyDB"
                },
                bus: {
                    testMode: true
                },
                lb: {
                    testMode: true
                },
                backends: {
                },
                servicecom: {
                    testMode: true
                }
            },
            backend1: {
                _id: "TestFs",
                backendType: "fs",
                path: reposDir
            }
        };

        baseUrl = `http://localhost:${testInfo.config.web.port}`;
        addBackend = async (data) => rp.post({
            url: `${baseUrl}/backend`,
            form: data,
            json: true
        });

        main = new Main(testInfo.name, testInfo.version);
        serviceMgr.create(main, testInfo.config);
        await main.awaitOnline();
        await addBackend(testInfo.backend1);
    });

    after(async () => {
        await fs.removeAsync(reposDir);
    });

    const assertRepoData = (data, expId, expVersionScheme = "default") => {
        assert.strictEqual(data.type, "logrepo.repository");
        assert.strictEqual(data._id, expId);
        assert.strictEqual(data.backend, testInfo.backend1._id);
        assert.strictEqual(data.versionScheme, expVersionScheme);
        assert.lengthOf(data.tags, 0);
        assert.property(data, "created");
        assert.property(data, "saved");
    };

    const assertLogData = (data, expName, expRepoId) => {
        assert.typeOf(data._id, "string");
        assert.strictEqual(data.type, "logrepo.log");
        assert.strictEqual(data.name, expName);
        assert.strictEqual(data.repository, expRepoId);
        assert.strictEqual(data.state, "created");
        assert.property(data, "fileMeta");
        assert.lengthOf(data.tags, 0);
        assert.property(data, "created");
        assert.property(data, "saved");
    };

    const addRepo = async (data) => {
        const result = await rp({
            method: "POST",
            url: `${baseUrl}/repository`,
            json: true,
            body: data
        });

        assert.strictEqual(result.result, "success");

        const extraArgs = [];
        if (data.versionScheme) {
            extraArgs.push(data.versionScheme);
        }
        assertRepoData(result.data, data._id, ...extraArgs);

        // Check that repository dir is created
        const repoPath = path.join(reposDir, result.data._id);
        const exist = await fs.existsAsync(repoPath);
        assert(exist, "repository dir is not created");

        return repoPath;
    };

    const addLog = async (data, repoPath = false) => {
        const result = await rp({
            method: "POST",
            url: `${baseUrl}/log`,
            json: true,
            body: data
        });

        assert.strictEqual(result.result, "success");
        assertLogData(result.data, data.name, data.repository);

        if (repoPath) {
            // TODO uncomment this assert and correct code
            // Check that log file is not created
            // const logRelPathParts = result.data._id.split("-");
            // const logPath = path.join(repoPath, ...logRelPathParts);
            // const exist = await fs.existsAsync(logPath);
            // assert(!exist, "Log already exist");
        }

        return result.data;
    };

    describe("that handles repositories", async () => {
        it("shall request repositories and get an empty list", async () => {
            const repos = await rp({
                url: `${baseUrl}/repository`,
                json: true
            });

            assert.lengthOf(repos, 0);
        });

        it("shall add a repository", async () => {
            await addRepo({
                _id: "repo1",
                backend: testInfo.backend1._id
            });
        });

        it("shall request repositories and get one back", async () => {
            const repos = await rp({
                url: `${baseUrl}/repository`,
                json: true
            });

            assert.lengthOf(repos, 1);
            assertRepoData(repos[0], "repo1");
        });

        it("shall request a repository by id and get one back", async () => {
            const repo = await rp({
                url: `${baseUrl}/repository/repo1`,
                json: true
            });

            assertRepoData(repo, "repo1");
        });

        it("shall add another repo", async () => {
            await addRepo({
                _id: "repo2",
                backend: testInfo.backend1._id
            });
        });

        it("shall request repositories and get two back", async () => {
            const repos = await rp({
                url: `${baseUrl}/repository`,
                json: true
            });

            assert.lengthOf(repos, 2);

            let repo1Checked = false;
            let repo2Checked = false;
            for (const repo of repos) {
                assertRepoData(repo, repo._id);
                if (repo._id === "repo1") {
                    repo1Checked = true;
                } else if (repo._id === "repo2") {
                    repo2Checked = true;
                }
            }
            assert(repo1Checked, "repo1 not got");
            assert(repo2Checked, "repo2 not got");
        });

        it("shall delete a repository", async () => {
            const result = await rp({
                method: "DELETE",
                url: `${baseUrl}/repository/repo2`,
                json: true
            });

            assert.equal(result.result, "success");
            assertRepoData(result.data, "repo2");

            // Check that repository dir is gone
            const repoPath = path.join(reposDir, result.data._id);
            const exist = await fs.existsAsync(repoPath);
            assert(!exist, "repository dir is not removed");
        });

        it("shall request repositories and get one back", async () => {
            const repos = await rp({
                url: `${baseUrl}/repository`,
                json: true
            });

            assert.lengthOf(repos, 1);
            assertRepoData(repos[0], "repo1");
        });

        it("shall delete a repository", async () => {
            const result = await rp({
                method: "DELETE",
                url: `${baseUrl}/repository/repo1`,
                json: true
            });

            assert.equal(result.result, "success");
            assertRepoData(result.data, "repo1");

            // Check that repository dir is gone
            const repoPath = path.join(reposDir, result.data._id);
            const exist = await fs.existsAsync(repoPath);
            assert(!exist, "repository dir is not removed");
        });

        it("shall request repositories and get an empty list", async () => {
            const repos = await rp({
                url: `${baseUrl}/repository`,
                json: true
            });

            assert.lengthOf(repos, 0);
        });

        it("shall not add a repository with wrong backend", async () => {
            try {
                await addRepo({
                    _id: "repo1",
                    backend: "non-existing-backend"
                });
                assert(false, "unexpected respository creation");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Unknown backend name non-existing-backend");
            }
        });
    });

    describe("that handles logs in repo", async () => {
        const logContent = "This is my log!\nAnd this is dead beaf!\n";
        const repo1Id = "repo1";
        let repo1Path;
        let log1Ver0Id;

        before(async () => {
            repo1Path = await addRepo({
                _id: repo1Id,
                backend: testInfo.backend1._id
            });
        });

        it("shall request logs and get an empty list", async () => {
            const logs = await rp({
                url: `${baseUrl}/log`,
                json: true
            });

            assert.lengthOf(logs, 0);
        });

        it("shall add a log", async () => {
            const data = await addLog({
                name: "log1",
                repository: repo1Id
            }, repo1Path);
            log1Ver0Id = data._id;
            console.log(`data: ${data._id}`);
        });

        it("shall request logs and get one back", async () => {
            const logs = await rp({
                url: `${baseUrl}/log`,
                json: true
            });

            assert.lengthOf(logs, 1);
            assertLogData(logs[0], "log1", repo1Id);
        });

        it("shall request log by id and get one back", async () => {
            console.log(`url: ${baseUrl}/log/${log1Ver0Id}`);
            const log = await rp({
                url: `${baseUrl}/log/${log1Ver0Id}`,
                json: true
            });

            assertLogData(log, "log1", repo1Id);
            assert.strictEqual(log._id, log1Ver0Id);
        });

        it("shall not download log before upload", async () => {
            try {
                await rp({
                    url: `${baseUrl}/log/${log1Ver0Id}/download`,
                    json: true
                });
                assert(false, "unexpected log download success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 404);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "No log uploaded");
            }
        });

        it("shall upload an log", async (ctx) => {
            ctx.timeout(10000);
            const result = await rp({
                method: "POST",
                url: `${baseUrl}/log/${log1Ver0Id}/upload`,
                json: true,
                formData: {
                    log: new Buffer(logContent)
                }
            });

            assert.strictEqual(result.result, "success");
            assert.strictEqual(result.data.state, "commited");
            assert.strictEqual(result.data.fileMeta.size, logContent.length);

            // Check that log file is created
            const logRelPathParts = result.data._id.split("-");
            const logPath = path.join(repo1Path, ...logRelPathParts);
            const logExist = await fs.existsAsync(logPath);
            assert(logExist, "log file not created");

            // Check that log content is correct
            const logBuf = await fs.readFileAsync(logPath);
            assert.strictEqual(logBuf.toString(), logContent);
        });

        it("shall download log", async () => {
            const result = await rp({
                url: `${baseUrl}/log/${log1Ver0Id}/download`,
                resolveWithFullResponse: true
            });
            assert.strictEqual(result.headers["content-type"], "application/octet-stream");
            assert.strictEqual(result.body, logContent);
        });

        it("shall not add an log with explicit _id", async () => {
            try {
                await addLog({
                    _id: "../../../some_malicious_path",
                    name: "log0",
                    repository: repo1Id
                });
                assert(false, "unexpected log create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Property _id exist");
            }
        });

        it("shall not add an log with non-existing repo", async () => {
            try {
                await addLog({
                    name: "log0",
                    repository: "non-existing-repo"
                });
                assert(false, "unexpected log create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Repository doesn't exist");
            }
        });
    });
});
