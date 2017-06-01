"use strict";

/* global describe it before after */

const { assert } = require("chai");
const rp = require("request-promise");
const { mochaPatch } = require("testsupport");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const Main = require("../lib/main");

mochaPatch();

describe("BaselineRepo", () => {
    let testInfo;
    let main;
    let baseUrl;

    let addBackend;

    before(async () => {
        testInfo = {
            name: "baselinerepo",
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
                }
            },
            backend1: {
                _id: "TestDummy",
                backendType: "dummy"
            }
        };

        baseUrl = `http://localhost:${testInfo.config.web.port}`;
        addBackend = async (data) => rp.post({
            url: `${baseUrl}/backend`,
            form: data,
            json: true
        });

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();
        await addBackend(testInfo.backend1);
    });

    after(async () => {
    });

    const assertRepoData = (data, expId) => {
        assert.strictEqual(data.type, "baselinerepo.repository");
        assert.strictEqual(data._id, expId);
        assert.strictEqual(data.backend, testInfo.backend1._id);
        assert.deepEqual(data.initialBaselineTags, [ `belongsTo_${expId}` ]);
        assert.lengthOf(data.tags, 0);
        assert.property(data, "created");
        assert.property(data, "saved");
    };

    const assertBaselineData = (data, expName, expRepoId) => {
        assert.typeOf(data._id, "string");
        assert.strictEqual(data.type, "baselinerepo.baseline");
        assert.strictEqual(data.name, expName);
        assert.strictEqual(data.repository, expRepoId);
        assert.deepEqual(data.tags, [ `belongsTo_${expRepoId}` ]);
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

        assertRepoData(result.data, data._id);
    };

    const addBaseline = async (data) => {
        const result = await rp({
            method: "POST",
            url: `${baseUrl}/baseline`,
            json: true,
            body: data
        });

        assert.strictEqual(result.result, "success");

        assertBaselineData(result.data, data.name, data.repository);

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
                backend: testInfo.backend1._id,
                initialBaselineTags: [ "belongsTo_repo1" ]
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
                backend: testInfo.backend1._id,
                initialBaselineTags: [ "belongsTo_repo2" ]
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

    describe("that handles backends in repo", async () => {
        const repo1Id = "repo1";
        let bl1Ver0Id;

        before(async () => {
            await addRepo({
                _id: repo1Id,
                backend: testInfo.backend1._id,
                initialBaselineTags: [ `belongsTo_${repo1Id}` ]
            });
        });

        it("shall request baseline and get an empty list", async () => {
            const baselines = await rp({
                url: `${baseUrl}/baseline`,
                json: true
            });

            assert.lengthOf(baselines, 0);
        });

        it("shall add an baseline", async () => {
            const data = await addBaseline({
                name: "bl1",
                repository: repo1Id
            });
            bl1Ver0Id = data._id;
        });

        it("shall request baseline and get one back", async () => {
            const baselines = await rp({
                url: `${baseUrl}/baseline`,
                json: true
            });

            assert.lengthOf(baselines, 1);
            assertBaselineData(baselines[0], "bl1", repo1Id);
        });

        it("shall request baseline by id and get one back", async () => {
            const baseline = await rp({
                url: `${baseUrl}/baseline/${bl1Ver0Id}`,
                json: true
            });

            assertBaselineData(baseline, "bl1", repo1Id);
            assert.strictEqual(baseline._id, bl1Ver0Id);
        });

        it("shall not add an baseline with explicit _id", async () => {
            try {
                await addBaseline({
                    _id: "../../../some_malicious_path",
                    name: "art0",
                    repository: repo1Id
                });
                assert(false, "unexpected baseline create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Property _id exist");
            }
        });

        it("shall not add an baseline with non-existing repo", async () => {
            try {
                await addBaseline({
                    name: "art0",
                    repository: "non-existing-repo"
                });
                assert(false, "unexpected baseline create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Repository doesn't exist");
            }
        });
    });
});
