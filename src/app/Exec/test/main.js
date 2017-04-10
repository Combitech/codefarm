"use strict";

/* global describe it before after beforeEach */

const { assert } = require("chai");
const { mochaPatch } = require("testsupport");
const path = require("path");
const rp = require("request-promise");
const fs = require("fs-extra-promise");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { StreamConverter } = require("misc");
const Main = require("../lib/main");
const { notification: typeNotification } = require("typelib");

mochaPatch();

const waitJobFinished = async (id) =>
    new Promise((resolve) => {
        const updatedListener = (job) => {
            if (job._id === id && job.finished) {
                typeNotification.removeListener("job.updated", updatedListener);
                resolve();
            }
        };
        typeNotification.on("job.updated", updatedListener);
    });

const DEFAULT_JOB_TIMEOUT = 10 * 1000;

describe("Exec", () => {
    let slavesDir;
    let testInfo;
    let main;
    let privateKeyPath;
    let uploadedArtifactContent;
    let uploadedLogContent;
    let lastArtifactPostData;
    let lastLogPostData;
    let lastCodeRepoMergeRevisionId;

    before(async () => {
        slavesDir = await fs.mkdtempAsync(path.join(__dirname, "tmp-"));
        console.log("SLAVES_DIR", slavesDir);
        const restServicePort = await getPort();
        testInfo = {
            name: "exec",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "info",
                bus: {
                    testMode: true
                },
                loglib: {
                    testMode: true
                },
                servicecom: {
                    testMode: true
                },
                exec: {
                    /* Configure to use test object REST API */
                    testMode: true,
                    uri: `http://localhost:${restServicePort}`,
                    testModeUseRest: true
                },
                artifactRepo: {
                    testMode: true,
                    testResponder: async (opts) => {
                        const res = {
                            _id: "testResponder-artifact-id-1",
                            type: "artifactrepo.artifact",
                            version: "0.0.5",
                            name: "testResponder-artifact-name-1",
                            repository: "testResponder-artifact-repository-id-1"
                        };
                        if (opts.method === "POST" && opts.uri.match(/\/upload/)) {
                            // Artifact upload action
                            const artifactStream = opts.formData.file;
                            // Consume stream...
                            uploadedArtifactContent = await (new StreamConverter(artifactStream)).toString();
                        }

                        return res;
                    }
                },
                codeRepo: {
                    testMode: true
                },
                logRepo: {
                    testMode: true,
                    testResponder: async (opts) => {
                        const res = {
                            _id: "testResponder-log-id-1",
                            name: "testResponder-log-name-1",
                            type: "logrepo.log"
                        };
                        if (opts.method === "POST" && opts.uri.match(/\/upload/)) {
                            // Log upload action
                            const logStream = opts.formData.file;
                            // Consume stream...
                            uploadedLogContent = await (new StreamConverter(logStream)).toString();
                        }

                        return res;
                    },
                    mb: {
                        testMode: true
                    }
                },
                db: {
                    testMode: true
                },
                web: {
                    port: restServicePort
                }
            }
        };

        const privateKeyPaths = [
            path.join(process.env.HOME, ".ssh", "id_rsa.dec"),
            path.join(process.env.HOME, ".ssh", "id_rsa")
        ];
        privateKeyPath = privateKeyPaths.filter((f) => fs.existsSync(f))[0];
        console.log("Test will use private key", privateKeyPath);

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();

        ServiceComBus.instance.on("request", async (request) => {
            if (request.data.typeName === "log" && request.data.method === "create") {
                lastLogPostData = request.data.params[0];

                ServiceComBus.instance.respond(request, {
                    _id: "testResponder-log-id-1",
                    name: "testResponder-log-name-1",
                    type: "logrepo.log"
                });
            } else if (request.data.typeName === "artifact" && request.data.method === "create") {
                lastArtifactPostData = request.data.params[0];

                ServiceComBus.instance.respond(request, {
                    _id: "testResponder-artifact-id-1",
                    type: "artifactrepo.artifact",
                    version: "0.0.5",
                    name: "testResponder-artifact-name-1",
                    repository: "testResponder-artifact-repository-id-1"
                });
            } else if (request.data.typeName === "revision" && request.data.method === "merge") {
                lastCodeRepoMergeRevisionId = request.data.params[0];

                ServiceComBus.instance.respond(request, {
                    _id: "testResponder-revision-id-1",
                    type: "coderepo.revision"
                });
            } else if (request.data.typeName === "revision" && request.data.method === "get") {
                ServiceComBus.instance.respond(request, {
                    _id: request.data.params[0],
                    type: `coderepo.${request.data.typeName}`
                });
            } else if (request.data.typeName === "repository" && request.data.method === "uri") {
                ServiceComBus.instance.respond(request, `ssh://$USER:localhost:1234/${request.data.params[0]}`);
            } else {
                console.log("Got request", request);
            }
        });
    });

    after(async () => {
        await fs.removeAsync(slavesDir);
    });

    beforeEach(() => {
        uploadedArtifactContent = null;
        uploadedLogContent = null;
        lastArtifactPostData = null;
        lastLogPostData = null;
        lastCodeRepoMergeRevisionId = null;
    });

    describe("Test slave REST API", () => {
        it("should list zero backends", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/backend`,
                json: true
            });

            assert.equal(data.length, 0);
        });

        it("should create a backend", async () => {
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/backend`,
                json: true,
                body: {
                    _id: "Backend1",
                    backendType: "direct",
                    privateKeyPath: "dummyKeyPath"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.type, "exec.backend");
            assert.equal(data.data._id, "Backend1");
            assert.equal(data.data.backendType, "direct");
            assert.equal(data.data.privateKeyPath, "dummyKeyPath");
        });

        it("should get a backend", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/backend/Backend1`,
                json: true
            });

            assert.equal(data.type, "exec.backend");
            assert.equal(data._id, "Backend1");
            assert.equal(data.backendType, "direct");
            assert.equal(data.privateKeyPath, "dummyKeyPath");
        });

        it("should delete a backend", async () => {
            const data = await rp({
                method: "DELETE",
                url: `http://localhost:${testInfo.config.web.port}/backend/Backend1`,
                json: true
            });

            assert.equal(data.result, "success");
        });

        it("should list zero backends", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/backend`,
                json: true
            });

            assert.equal(data.length, 0);
        });

        it("should list zero slaves", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/slave`,
                json: true
            });

            assert.equal(data.length, 0);
        });

        let slaveId;

        it("should create a slave", async () => {
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/slave`,
                json: true,
                body: {
                    _id: "Slave1",
                    uri: `ssh://${process.env.USER}@localhost:${slavesDir}`,
                    tags: [ "tag1", "tag2" ],
                    executors: 1,
                    backend: "Backend1",
                    privateKeyPath: privateKeyPath,
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.uri, `ssh://${process.env.USER}@localhost:${slavesDir}`);
            assert.deepEqual(data.data.tags, [ "tag1", "tag2", data.data._id ]);
            assert.equal(data.data.backend, "Backend1");
            assert.equal(data.data.executors, 1);
            assert.equal(data.data.privateKeyPath, privateKeyPath);

            slaveId = data.data._id;
        });

        it("should get a slave", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/slave/${slaveId}`,
                json: true
            });

            assert.equal(data._id, slaveId);
            assert.equal(data.uri, `ssh://${process.env.USER}@localhost:${slavesDir}`);
            assert.deepEqual(data.tags, [ "tag1", "tag2", data._id ]);
            assert.equal(data.executors, 1);
            assert.equal(data.privateKeyPath, privateKeyPath);
        });

        it("should list one slave", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/slave`,
                json: true
            });

            assert.equal(data.length, 1);
        });

        it("should delete a slave", async () => {
            const data = await rp({
                method: "DELETE",
                url: `http://localhost:${testInfo.config.web.port}/slave/${slaveId}`,
                qs: {
                    force: true
                },
                json: true
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.uri, `ssh://${process.env.USER}@localhost:${slavesDir}`);
            assert.deepEqual(data.data.tags, [ "tag1", "tag2", data.data._id ]);
            assert.equal(data.data.executors, 1);
            assert.equal(data.data.privateKeyPath, privateKeyPath);
        });

        it("should list zero slaves", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/slave`,
                json: true
            });

            assert.equal(data.length, 0);
        });
    });

    describe("Test job REST API", () => {
        it("should create a backend", async () => {
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/backend`,
                json: true,
                body: {
                    _id: "Backend1",
                    backendType: "direct",
                    privateKeyPath: "dummyKeyPath"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.type, "exec.backend");
            assert.equal(data.data._id, "Backend1");
            assert.equal(data.data.backendType, "direct");
            assert.equal(data.data.privateKeyPath, "dummyKeyPath");
        });

        it("should create a slave", async () => {
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/slave`,
                json: true,
                body: {
                    _id: "Slave2",
                    uri: `ssh://${process.env.USER}@localhost:${slavesDir}`,
                    tags: [ "tag1", "tag2" ],
                    executors: 1,
                    backend: "Backend1",
                    privateKeyPath: privateKeyPath,
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.uri, `ssh://${process.env.USER}@localhost:${slavesDir}`);
            assert.deepEqual(data.data.tags, [ "tag1", "tag2", data.data._id ]);
            assert.equal(data.data.executors, 1);
            assert.equal(data.data.privateKeyPath, privateKeyPath);
        });

        const testScript1 = `#!/bin/bash -e
            echo I will succeed
        `;

        it("should create a job", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test Job",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript1),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test Job");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript1);
        });

        it("should list one job", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this

            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true
            });

            assert.equal(data.length, 1);

            await waitJobFinished(data[0]._id);
        });

        it("should list one successful job", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true
            });

            assert.equal(data.length, 1);
            assert.equal(data[0].name, "Test Job");
            assert.equal(data[0].status, "success");
            assert.notEqual(data[0].finished, false);
            assert.equal(data[0].criteria, "tag1 AND tag2");
            assert.equal(data[0].script, testScript1);
        });

        const testScript2 = `#!/bin/bash -e
            echo I will fail
            exit 1
        `;
        let jobId2;
        it("should create a failing job", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Failing Test Job",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript2),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Failing Test Job");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript2);
            jobId2 = data.data._id;
            await waitJobFinished(jobId2);
        });

        it("should list one successful job", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId2}`,
                json: true
            });

            assert.equal(data.name, "Failing Test Job");
            assert.equal(data.status, "fail");
            assert.notEqual(data.finished, false);
            assert.equal(data.criteria, "tag1 AND tag2");
            assert.equal(data.script, testScript2);
        });

        let jobId3;
        it("should create a job that notifies a subjob", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this
            const subJobResultData = {
                execTime: 100
            };
            /* Test script 3 will create an ongoing sub-job, and
             * later on set the sub-job status to success. */
            const testScript3 = `#!/bin/bash -e
                echo I will create a subjob
                subJobId=$(node --harmony_async_await ./cli.js -q '$._id' --format values create_subjob test tc1 ongoing)
                echo Sub-job created id: $subJobId
                subJobId2=$(node --harmony_async_await ./cli.js -q '$._id' --format values update_subjob -r '${JSON.stringify(subJobResultData)}' -s success "$subJobId")
                echo Sub-job updated id: $subJobId2
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test with sub-jobs",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript3),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test with sub-jobs");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript3);
            await waitJobFinished(data.data._id);
            jobId3 = data.data._id;
        });

        it("should list one successful sub-job", async () => {
            const data = await rp({
                url: `http://localhost:${testInfo.config.web.port}/subjob`,
                qs: {
                    jobId: jobId3
                },
                json: true
            });

            assert.equal(data.length, 1);
            assert.equal(data[0].name, "tc1");
            assert.equal(data[0].kind, "test");
            assert.equal(data[0].status, "success");
            assert.notEqual(data[0].finished, false);
            assert.property(data[0], "result", "expected result property");
            assert.property(data[0].result, "execTime", "expected result.execTime property");
            assert.equal(data[0].result.execTime, 100);
        });

        it("should create a job that uploads an artifact", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this
            const artifactContent = "artifact2 content";

            /* Test script will create an artifact. */
            const testScript = `#!/bin/bash -e
                echo I will create an artifact
                echo "${artifactContent}" > artifact.txt
                response=$(node --harmony_async_await ./cli.js create_artifact -t atag1 -t atag2 --file "$PWD/artifact.txt" artifact2 artifactRepo1)
                echo Upload artifact response: $response
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test with artifacts",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test with artifacts");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
            assert.lengthOf(jobData.runs[0].artifacts, 1);
            // name and id set by testResponder in config
            assert.equal(jobData.runs[0].artifacts[0].name, "testResponder-artifact-name-1");
            assert.equal(jobData.runs[0].artifacts[0].repository, "testResponder-artifact-repository-id-1");
            assert.equal(jobData.runs[0].artifacts[0].version, "0.0.5");
            assert.equal(jobData.runs[0].artifacts[0].id, "testResponder-artifact-id-1");

            // Verify uploaded artifact content
            assert.strictEqual(uploadedArtifactContent, `${artifactContent}\n`);
            assert.strictEqual(lastArtifactPostData.name, "artifact2");
            assert.strictEqual(lastArtifactPostData.repository, "artifactRepo1");
            assert.include(lastArtifactPostData.tags, "atag1");
            assert.include(lastArtifactPostData.tags, "atag2");
            assert.lengthOf(lastArtifactPostData.tags, 5); // 2 tags above +3 default tags
        });

        it("should create a job that pre allocates and uploads an artifact", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this

            /* Test script will pre-allocate an artifact and upload a
             * file containing artifact version and id */
            const testScript = `#!/bin/bash -e
                echo I will create an artifact
                response=( $(node --harmony_async_await ./cli.js -q '$._id' -q '$.version' --format values create_artifact -t btag1 -t btag2 artifact1 artifactRepo1) )
                echo Create response: \${response[*]}
                artifactId=\${response[0]}
                artifactVersion=\${response[1]}
                echo Artifact id: $artifactId
                echo Artifact version: $artifactVersion
                echo "artifact:$artifactVersion:$artifactId" > artifact.txt
                response=$(node --harmony_async_await ./cli.js upload_artifact "$artifactId" "$PWD/artifact.txt")
                echo Upload artifact response: $response
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test with artifacts",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test with artifacts");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
            assert.lengthOf(jobData.runs[0].artifacts, 1);
            // name and id set by testResponder in config
            assert.equal(jobData.runs[0].artifacts[0].name, "testResponder-artifact-name-1");
            assert.equal(jobData.runs[0].artifacts[0].repository, "testResponder-artifact-repository-id-1");
            assert.equal(jobData.runs[0].artifacts[0].version, "0.0.5");
            assert.equal(jobData.runs[0].artifacts[0].id, "testResponder-artifact-id-1");

            // Verify uploaded artifact content
            assert.strictEqual(uploadedArtifactContent, "artifact:0.0.5:testResponder-artifact-id-1\n");
            assert.strictEqual(lastArtifactPostData.name, "artifact1");
            assert.strictEqual(lastArtifactPostData.repository, "artifactRepo1");
            assert.include(lastArtifactPostData.tags, "btag1");
            assert.include(lastArtifactPostData.tags, "btag2");
            assert.lengthOf(lastArtifactPostData.tags, 5); // 2 tags above +3 default tags
        });

        it("should create a job that uploads a log", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this
            const logContent = "log.txt content";

            /* Test script will create and update a logfile. */
            const testScript = `#!/bin/bash -e
                echo I will create a log
                echo "${logContent}" > log.txt
                response=$(node --harmony_async_await ./cli.js upload_log -t tag1 -t tag2 "$PWD/log.txt" "log.txt")
                echo Upload log response: $response
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test with logs",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test with logs");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
            assert.lengthOf(jobData.runs[0].logs, 2);
            assert.equal(jobData.runs[0].logs[0].name, "stdout");
            // name and id set by testResponder in config
            assert.equal(jobData.runs[0].logs[1].name, "testResponder-log-name-1");
            assert.equal(jobData.runs[0].logs[1].id, "testResponder-log-id-1");

            // Verify uploaded log content
            assert.strictEqual(uploadedLogContent, `${logContent}\n`);
            assert.strictEqual(
                lastLogPostData.name,
                "Test with logs-log.txt"
            );
            assert.include(lastLogPostData.tags, "tag1");
            assert.include(lastLogPostData.tags, "tag2");
            assert.lengthOf(lastLogPostData.tags, 5); // 2 tags above +3 default tags
        });

        it("should create a job that merges a revision", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this

            /* Test script will merge a revision. */
            const testScript = `#!/bin/bash -e
                CLI="node --harmony_async_await $\{PWD\}/cli.js"
                echo I will merge a revision
                jobData=( $($CLI -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file $\{PWD\}/data.json) )
                revision=$\{jobData[0]\}
                echo Merge revision $revision read from data.json
                response=( $($CLI merge_revision $revision) )
                echo Merge revision response: $response
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test that merges",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test that merges");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
            assert.lengthOf(jobData.runs[0].revisions, 1);
            // id set by testResponder in config
            assert.equal(jobData.runs[0].revisions[0].id, "testResponder-revision-id-1");
            assert.equal(jobData.runs[0].revisions[0].state, "merged");

            // Verify post content
            assert.strictEqual(lastCodeRepoMergeRevisionId, "lastChange");
        });

        it("should create a job that checks environment variables", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this

            const testScript = `#!/bin/bash -e
                echo Job id: $CF_JOB_ID
                echo Job name: $CF_JOB_NAME
                cfEnv=$(env|sed -n '/^CF_/p')
                echo Code Farm environment: $cfEnv
                test "$CF_JOB_ID" || (echo "CF_JOB_ID NOK" && exit 1)
                test "$CF_JOB_NAME" || (echo "CF_JOB_NAME NOK" && exit 1)
                test "$CF_JOB_BASELINE_ID" || (echo "CF_JOB_ID CF_JOB_BASELINE_ID" && exit 1)
                test "$CF_JOB_BASELINE_NAME" || (echo "CF_JOB_BASELINE_NAME NOK" && exit 1)
                test "$CF_JOB_BASELINE_CONTENT_0_NAME" || (echo "CF_JOB_BASELINE_CONTENT_0_NAME NOK" && exit 1)
                test "$CF_JOB_BASELINE_CONTENT_0_TYPE" || (echo "CF_JOB_BASELINE_CONTENT_0_TYPE NOK" && exit 1)
                test "$CF_JOB_BASELINE_CONTENT_0_ID_0" || (echo "CF_JOB_BASELINE_CONTENT_0_ID_0 NOK" && exit 1)
                test "$CF_JOB_BASELINE_CONTENT_0_ID_LENGTH" || (echo "CF_JOB_BASELINE_CONTENT_0_ID_LENGTH NOK" && exit 1)
                echo "All variables OK"
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test that checks environment",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test that checks environment");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
        });

        it("should create a job that reads types", async (ctx) => {
            ctx.timeout(DEFAULT_JOB_TIMEOUT); // eslint-disable-line no-invalid-this

            /* Script:
             * 1. Reads revisionId from environment
             * 2. Reads revision type via script command socket.
             * 3. Reads repository uri via script command socket.
             * 4. Writes results to result.txt and uploads that file
             */
            const testScript = `#!/bin/bash -e
                CLI="node --harmony_async_await $\{PWD\}/cli.js"
                jobData=( $($CLI -q '$.job.name' -q '$.job.baseline.content[?(@.name === "commits")].id[-1:]' --format values load_file $\{PWD\}/data.json) )
                jobName=$\{jobData[0]\}
                echo Job name: $jobName
                echo $jobName > result.txt
                revision=$\{jobData[1]\}
                echo $revision >> result.txt
                echo Job works on revision $revision
                revisionObj=$(node --harmony_async_await ./cli.js read_type coderepo.revision $revision)
                echo Revision object: $revisionObj
                echo "$revisionObj" >> result.txt
                uri=$(node --harmony_async_await ./cli.js read_type --getter uri coderepo.repository repo1)
                echo Repo uri: $uri
                echo "$uri" >> result.txt
                response=$(node --harmony_async_await ./cli.js upload_log "$PWD/result.txt" "result.txt")
                echo Upload log response: $response
                exit 0
            `;
            const data = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/job`,
                json: true,
                form: {
                    name: "Test_that_reads_types",
                    criteria: "tag1 AND tag2",
                    script: new Buffer(testScript),
                    baseline: {
                        _id: "baseline1",
                        name: "myBaseline",
                        content: [
                            {
                                _ref: true,
                                name: "commits",
                                type: "coderepo.revision",
                                id: [ "change1", "change2", "lastChange" ]
                            }
                        ]
                    },
                    workspaceCleanup: "remove_on_finish"
                }
            });

            assert.equal(data.result, "success");
            assert.equal(data.data.name, "Test_that_reads_types");
            assert.oneOf(data.data.status, [ "queued", "ongoing" ]);
            assert.equal(data.data.finished, false);
            assert.equal(data.data.criteria, "tag1 AND tag2");
            assert.equal(data.data.script, testScript);
            await waitJobFinished(data.data._id);
            const jobId = data.data._id;

            // Check that job has finished
            const jobData = await rp({
                method: "GET",
                url: `http://localhost:${testInfo.config.web.port}/job/${jobId}`,
                json: true
            });

            assert.notEqual(jobData.finished, false);
            assert.equal(jobData.status, "success");
            assert.strictEqual(jobData.lastRunId, 0);
            assert.lengthOf(jobData.runs[0].logs, 2);
            // Verify uploaded log content
            const uploadedLogLines = uploadedLogContent.split("\n");
            assert(uploadedLogLines.length > 3);
            assert.strictEqual(uploadedLogLines[0], "Test_that_reads_types");
            assert.strictEqual(uploadedLogLines[1], "lastChange");
            const revisionReadResponse = JSON.parse(uploadedLogLines[2]);
            assert.deepEqual(revisionReadResponse, {
                _id: "lastChange",
                type: "coderepo.revision"
            });
            const repoUriReadResponse = JSON.parse(uploadedLogLines[3]);
            assert.strictEqual(repoUriReadResponse, "ssh://$USER:localhost:1234/repo1");
        });
    });
});
