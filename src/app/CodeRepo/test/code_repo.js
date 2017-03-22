"use strict";

/* global describe it before after */

const { assert } = require("chai");
const path = require("path");
const fs = require("fs-extra-promise");
const getPort = require("get-port");
const { mochaPatch } = require("testsupport");
const Main = require("../lib/main");
const rp = require("request-promise");
const { ServiceMgr } = require("service");

mochaPatch();

describe("GithubBackend", () => {
    let testInfo;
    let main;
    let baseUrl;
    let testTmpDir;
    let tmpPrivateKeyFile;

    let addBackend;
    let deleteBackend;

    before(async () => {
        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception", error);
            assert(false, `Uncaught exception, error: ${error.message}`);
        });
        process.on("unhandledRejection", (error, promise) => {
            console.error("Unhandled promise rejection", error);
            console.error("Promise", promise);
            assert(false, `Unhandled promise rejection, error: ${error.message}`);
        });
        testTmpDir = await fs.mkdtempAsync(path.join(__dirname, "tmp-"));
        tmpPrivateKeyFile = path.join(testTmpDir, "privateKey");
        await fs.writeFileAsync(tmpPrivateKeyFile, "dummy private key");
        testInfo = {
            name: "coderepo",
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
                        baseUrl: "http://localhost",
                        apiBaseUrl: "http://localhost"
                    },
                    gerrit: {
                        defaultPort: 29418,
                        defaultTimeoutMs: 10 * 1000
                    }
                }
            },
            gitHubBackend: {
                _id: "GitHubBackend1",
                backendType: "github",
                port: await getPort(),
                target: "dummyTarget1",
                isOrganization: true,
                authUser: "gitHubUser1",
                authToken: "gitHubUserToken1",
                webhookURL: "dummyUrl1"
            },
            gerritBackend: {
                _id: "GerritBackend1",
                backendType: "gerrit",
                uri: "dummyUri1",
                privateKeyPath: tmpPrivateKeyFile
            },
            unknownTypeBackend: {
                _id: "UnknownTypeBackend1",
                backendType: "unknown"
            }

        };

        baseUrl = `http://localhost:${testInfo.config.web.port}`;
        addBackend = async (data) => rp.post({
            url: `${baseUrl}/backend`,
            body: data,
            json: true
        });
        deleteBackend = async (name) => rp.delete({
            url: `${baseUrl}/backend/${name}`
        });

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();
//        await addBackend(testInfo.backend1);
    });

    after(async () => {
        await fs.removeAsync(tmpPrivateKeyFile);
        await fs.removeAsync(testTmpDir);
    });

    const assertBackendData = (data, expId) => {
        assert.strictEqual(data.type, "coderepo.backend");
        assert.strictEqual(data._id, expId);
        assert.lengthOf(data.tags, 0);
        assert.property(data, "created");
        assert.property(data, "saved");
    };

    describe("Backends", async () => {
        it("shall get empty backend list", async () => {
            const backends = await rp({
                url: `${baseUrl}/backend`,
                json: true
            });

            assert.lengthOf(backends, 0);
        });

        it("shall add a GitHub backend", async () => {
            await addBackend(testInfo.gitHubBackend);
        });

        it("shall request backends and get one back", async () => {
            const backends = await rp({
                url: `${baseUrl}/backend`,
                json: true
            });

            assert.lengthOf(backends, 1);
            assertBackendData(backends[0], testInfo.gitHubBackend._id);
        });

        it("shall not add same backend again", async () => {
            try {
                await addBackend(testInfo.gitHubBackend);
                assert(false, "unexpected backend creation");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, `Object with id ${testInfo.gitHubBackend._id} already exist`);
            }
        });

        it("shall not add backend of illegal type", async () => {
            try {
                await addBackend(testInfo.unknownTypeBackend);
                assert(false, "unexpected backend creation");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.strictEqual(error.error.result, "fail");
                assert.strictEqual(error.error.error, `Unknown backend type ${testInfo.unknownTypeBackend.backendType}`);
            }
        });

        it("shall add a Gerrit backend", async () => {
            await addBackend(testInfo.gerritBackend);
        });

        it("shall request backends and get two back", async () => {
            const backends = await rp({
                url: `${baseUrl}/backend`,
                json: true
            });

            assert.lengthOf(backends, 2);
            assertBackendData(backends[0], testInfo.gitHubBackend._id);
            assertBackendData(backends[1], testInfo.gerritBackend._id);
        });

        it("shall request backend by id and get one back", async () => {
            const backend = await rp({
                url: `${baseUrl}/backend/${testInfo.gitHubBackend._id}`,
                json: true
            });

            assertBackendData(backend, testInfo.gitHubBackend._id);
        });

        it("shall delete backends", async () => {
            await deleteBackend(testInfo.gitHubBackend._id);
            await deleteBackend(testInfo.gerritBackend._id);
        });

        it("shall get empty backend list", async () => {
            const backends = await rp({
                url: `${baseUrl}/backend`,
                json: true
            });

            assert.lengthOf(backends, 0);
        });
    });
});
