"use strict";

/* global describe it before after */

const { assert } = require("chai");
const path = require("path");
const fs = require("fs-extra-promise");
const rp = require("request-promise");
const digestStream = require("digest-stream");
const { Readable } = require("stream");
const { mochaPatch } = require("testsupport");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const Main = require("../lib/main");
const version = require("version");

mochaPatch();

describe("ArtifactRepo", () => {
    let testInfo;
    let main;
    let baseUrl;
    let reposDir;

    let addBackend;

    before(async () => {
        reposDir = await fs.mkdtempAsync(path.join(__dirname, "tmp-"));
        testInfo = {
            name: "artifactrepo",
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
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();
        await addBackend(testInfo.backend1);
    });

    after(async () => {
        await fs.removeAsync(reposDir);
    });

    const assertRepoData = (data, expId, expVersionScheme = "default") => {
        assert.strictEqual(data.type, "artifactrepo.repository");
        assert.strictEqual(data._id, expId);
        assert.strictEqual(data.backend, testInfo.backend1._id);
        assert.strictEqual(data.versionScheme, expVersionScheme);
        assert.lengthOf(data.tags, 0);
        assert.property(data, "created");
        assert.property(data, "saved");
    };

    const assertArtifactData = (data, expName, expRepoId, expVersion = "0.0.1") => {
        assert.typeOf(data._id, "string");
        assert.strictEqual(data.type, "artifactrepo.artifact");
        assert.strictEqual(data.name, expName);
        assert.strictEqual(data.repository, expRepoId);
        assert.strictEqual(data.state, "created");
        assert.strictEqual(data.version, expVersion);
        assert.property(data, "fileMeta");
        assert(data.parentIds.length >= 0);
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

    const addArtifact = async (data, repoPath = false, expectedVersion = "0.0.1") => {
        const result = await rp({
            method: "POST",
            url: `${baseUrl}/artifact`,
            json: true,
            body: data
        });

        assert.strictEqual(result.result, "success");

        const extraArgs = [];
        if (data.version) {
            extraArgs.push(data.version);
        } else {
            extraArgs.push(expectedVersion);
        }
        assertArtifactData(result.data, data.name, data.repository, ...extraArgs);

        if (repoPath) {
            // Check that artifact file is not created
            const artifactRelPathParts = result.data._id.split("-");
            const artifactPath = path.join(repoPath, ...artifactRelPathParts);
            const exist = await fs.existsAsync(artifactPath);
            assert(!exist, "artifact already exist");
        }

        return result.data;
    };

    const hashStringAsync = (alg, str, digestEncoding = "hex") =>
        new Promise((resolve, reject) => {
            const s = new Readable();
            s.pipe(digestStream(alg, digestEncoding, (hash) => {
                resolve(hash);
            }).on("error", reject));
            s.push(str);
            s.push(null);
        });

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

        it("shall not add a repository with wrong versionScheme", async () => {
            try {
                await addRepo({
                    _id: "repo1",
                    backend: testInfo.backend1._id,
                    versionScheme: "non-existing-scheme"
                });
                assert(false, "unexpected respository creation");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Invalid version scheme non-existing-scheme");
            }
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

    describe("that handles artifacts in repo with default version scheme", async () => {
        const artifactContent = "This is my artifact!\nAnd this is dead beaf!\n";
        const repo1Id = "repo1";
        let repo1Path;
        let art1Ver0Id;
        let art1Ver0Path;

        before(async () => {
            repo1Path = await addRepo({
                _id: repo1Id,
                backend: testInfo.backend1._id
            });
        });

        it("shall request artifacts and get an empty list", async () => {
            const artifacts = await rp({
                url: `${baseUrl}/artifact`,
                json: true
            });

            assert.lengthOf(artifacts, 0);
        });

        it("shall add an artifact", async () => {
            const data = await addArtifact({
                name: "art1",
                repository: repo1Id
            }, repo1Path);
            art1Ver0Id = data._id;
        });

        it("shall request artifact and get one back", async () => {
            const artifacts = await rp({
                url: `${baseUrl}/artifact`,
                json: true
            });

            assert.lengthOf(artifacts, 1);
            assertArtifactData(artifacts[0], "art1", repo1Id);
        });

        it("shall request artifact by id and get one back", async () => {
            const artifact = await rp({
                url: `${baseUrl}/artifact/${art1Ver0Id}`,
                json: true
            });

            assertArtifactData(artifact, "art1", repo1Id);
            assert.strictEqual(artifact._id, art1Ver0Id);
        });

        it("shall not download artifact before upload", async () => {
            try {
                await rp({
                    url: `${baseUrl}/artifact/${art1Ver0Id}/download`,
                    json: true
                });
                assert(false, "unexpected artifact download success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 404);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "No artifact uploaded");
            }
        });

        it("shall upload an artifact", async (ctx) => {
            ctx.timeout(10000);
            const result = await rp({
                method: "POST",
                url: `${baseUrl}/artifact/${art1Ver0Id}/upload`,
                json: true,
                formData: {
                    artifact: new Buffer(artifactContent)
                }
            });

            assert.strictEqual(result.result, "success");
            assert.strictEqual(result.data.state, "commited");
            // BEGIN: Debug printouts to track down intermittent error
            console.log("_TMP_DBG_PRINT_ data", JSON.stringify(result.data, null, 2));
            {
                // Check that artifact file is created
                const artifactRelPathParts = result.data._id.split("-");
                const artifactPath = path.join(repo1Path, ...artifactRelPathParts);
                console.log("_TMP_DBG_PRINT_ artifactPath", artifactPath);
                const artifactExist = await fs.existsAsync(artifactPath);
                console.log("_TMP_DBG_PRINT_ artifactExist", artifactExist);
            }
            // END: Debug printouts...
            assert.strictEqual(result.data.fileMeta.size, artifactContent.length);

            // Check hashes
            const md5 = await hashStringAsync("md5", artifactContent);
            const sha1 = await hashStringAsync("sha1", artifactContent);
            assert.strictEqual(result.data.fileMeta.hashes.md5, md5);
            assert.strictEqual(result.data.fileMeta.hashes.sha1, sha1);

            // Check that artifact file is created
            const artifactRelPathParts = result.data._id.split("-");
            const artifactPath = path.join(repo1Path, ...artifactRelPathParts);
            const artifactExist = await fs.existsAsync(artifactPath);
            assert(artifactExist, "artifact file not created");

            // Check that artifact content is correct
            const artifactBuf = await fs.readFileAsync(artifactPath);
            assert.strictEqual(artifactBuf.toString(), artifactContent);
            art1Ver0Path = artifactPath;
        });

        it("shall download artifact", async () => {
            const result = await rp({
                url: `${baseUrl}/artifact/${art1Ver0Id}/download`,
                resolveWithFullResponse: true
            });
            assert.strictEqual(result.headers["content-type"], "application/octet-stream");
            assert.strictEqual(result.body, artifactContent);
        });

        it("shall validate artifact ok when untampered", async () => {
            const result = await rp.post({
                url: `${baseUrl}/artifact/${art1Ver0Id}/validate`,
                json: true
            });

            assert.strictEqual(result.result, "success");
            assert.strictEqual(result.data.artifact.state, "commited");
            assert.strictEqual(result.data.artifact.fileMeta.size, artifactContent.length);

            assert.isTrue(result.data.validation.md5);
            assert.isTrue(result.data.validation.sha1);
        });

        it("shall validate artifact not ok when tampered", async () => {
            // Modify artifact file
            await fs.appendFileAsync(art1Ver0Path, "\n*** FILE TAMPERED WITH ***\n");

            const result = await rp.post({
                url: `${baseUrl}/artifact/${art1Ver0Id}/validate`,
                json: true
            });

            assert.strictEqual(result.result, "success");
            assert.strictEqual(result.data.artifact.state, "commited");
            assert.strictEqual(result.data.artifact.fileMeta.size, artifactContent.length);

            assert.isFalse(result.data.validation.md5);
            assert.isFalse(result.data.validation.sha1);
        });

        it("shall not add an artifact with explicit _id", async () => {
            try {
                await addArtifact({
                    _id: "../../../some_malicious_path",
                    name: "art0",
                    repository: repo1Id
                });
                assert(false, "unexpected artifact create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Property _id exist");
            }
        });

        it("shall not add an artifact with non-existing repo", async () => {
            try {
                await addArtifact({
                    name: "art0",
                    repository: "non-existing-repo"
                });
                assert(false, "unexpected artifact create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, "Repository doesn't exist");
            }
        });

        let art1ParentId;
        for (let ver = 2; ver < 5; ver++) {
            it(`shall add new version 0.0.${ver} of artifact`, async () => {
                const data = await addArtifact({
                    name: "art1",
                    repository: repo1Id
                }, repo1Path, `0.0.${ver}`);
                // Check that it's connected to it's previous version
                const expectedParentId = art1ParentId ? art1ParentId : art1Ver0Id;
                assert.deepEqual(data.parentIds, [ expectedParentId ]);
                art1ParentId = data._id;
            });
        }

        for (const ver of [ "0.1.0", "0.1.1", "9.0.0" ]) {
            it(`shall add artifact with requested future version ${ver}`, async () => {
                const data = await addArtifact({
                    name: "art1",
                    repository: repo1Id,
                    version: ver
                }, repo1Path);
                // Check that it's connected to it's previous version
                assert.deepEqual(data.parentIds, [ art1ParentId ]);
                art1ParentId = data._id;
            });
        }

        it("shall add artifact without requesting version and step patch", async () => {
            const data = await addArtifact({
                name: "art1",
                repository: repo1Id
            }, repo1Path, "9.0.1");
            // Check that it's connected to it's previous version
            assert.deepEqual(data.parentIds, [ art1ParentId ]);
            art1ParentId = data._id;
        });

        it("shall add another artifact with initial version", async () => {
            const data = await addArtifact({
                name: "art2",
                repository: repo1Id
            }, repo1Path, "0.0.1");
            assert.lengthOf(data.parentIds, 0);
        });

        it("shall not add an artifact with old version", async () => {
            try {
                await addArtifact({
                    name: "art1",
                    repository: repo1Id,
                    version: "8.0.0"
                });
                assert(false, "unexpected artifact create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(
                    error.error.error,
                    "Requested version 8.0.0 smaller than latest 9.0.1"
                );
            }
        });

        it("shall calculate version correctly for simultaneous add of artifacts", async () => {
            const createJobs = [];
            for (let i = 0; i < 20; i++) {
                const createJob = rp({
                    method: "POST",
                    url: `${baseUrl}/artifact`,
                    json: true,
                    body: {
                        name: "artSim1",
                        repository: repo1Id
                    }
                });
                createJobs.push(createJob);
            }
            const results = await Promise.all(createJobs);
            const versions = [];
            for (const res of results) {
                assert.strictEqual(res.result, "success");
                versions.push(res.data.version);
            }


            // Sort and remove duplicates from versions
            const versionGen = version.create("default");
            versions.sort((a, b) => versionGen.compare(a, b));
            const expectedVersions = versions.map((ver, index) => `0.0.${index + 1}`);
            assert.deepEqual(versions, expectedVersions);
        });
    });

    describe("that handles artifacts in repo with rstate version scheme", async () => {
        const repo2Id = "repo2";
        let repo2Path;
        let art1Ver0Id;

        before(async () => {
            repo2Path = await addRepo({
                _id: repo2Id,
                backend: testInfo.backend1._id,
                versionScheme: "rstate"
            });
        });

        it("shall add one artifact with initial version", async () => {
            const data = await addArtifact({
                name: "art1",
                repository: repo2Id
            }, repo2Path, "R1A");
            assert.lengthOf(data.parentIds, 0);
            art1Ver0Id = data._id;
        });

        let art1ParentId;
        for (const ver of [ "R1B", "R1C" ]) {
            it(`shall add new artifact with version ${ver}`, async () => {
                const data = await addArtifact({
                    name: "art1",
                    repository: repo2Id
                }, repo2Path, ver);
                // Check that it's connected to it's previous version
                const expectedParentId = art1ParentId ? art1ParentId : art1Ver0Id;
                assert.deepEqual(data.parentIds, [ expectedParentId ]);
                art1ParentId = data._id;
            });
        }

        for (const ver of [ "R2A", "R2E", "R2FF", "R99D" ]) {
            it(`shall add artifact with requested future version ${ver}`, async () => {
                const data = await addArtifact({
                    name: "art1",
                    repository: repo2Id,
                    version: ver
                }, repo2Path);
                // Check that it's connected to it's previous version
                const expectedParentId = art1ParentId ? art1ParentId : art1Ver0Id;
                assert.deepEqual(data.parentIds, [ expectedParentId ]);
                art1ParentId = data._id;
            });
        }

        it("shall add artifact without requesting version and step letter", async () => {
            const data = await addArtifact({
                name: "art1",
                repository: repo2Id
            }, repo2Path, "R99E");
            // Check that it's connected to it's previous version
            const expectedParentId = art1ParentId ? art1ParentId : art1Ver0Id;
            assert.deepEqual(data.parentIds, [ expectedParentId ]);
            art1ParentId = data._id;
        });

        it("shall add another artifact with initial version", async () => {
            const data = await addArtifact({
                name: "art2",
                repository: repo2Id
            }, repo2Path, "R1A");
            assert.lengthOf(data.parentIds, 0);
        });

        it("shall not add an artifact with old version", async () => {
            try {
                await addArtifact({
                    name: "art1",
                    repository: repo2Id,
                    version: "R3A"
                });
                assert(false, "unexpected artifact create success");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(
                    error.error.error,
                    "Requested version R3A smaller than latest R99E"
                );
            }
        });
    });
});
