"use strict";

/* global describe it before after */

const { assert } = require("chai");
const getPort = require("get-port");
const { mochaPatch } = require("testsupport");
const Main = require("../lib/main");
// const rp = require("request-promise");
const { ServiceMgr } = require("service");

mochaPatch();

describe("GithubBackend", () => {
    let testInfo;
    let main;

//    let baseUrl;
//    let addBackend;
//    let deleteBackend;

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
            }
        };

//        baseUrl = `http://localhost:${testInfo.config.web.port}`;
/*
        addBackend = async (data) => rp.post({
            url: `${baseUrl}/backend`,
            body: data,
            json: true
        });
*/

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();
//        await addBackend(testInfo.gitHubBackend);
    });

    after(async () => {
/*
        deleteBackend = async (name) => rp.delete({
            url: `${baseUrl}/backend/${name}`
        });

        await deleteBackend(testInfo.gitHubBackend._id);
*/
    });

    describe("GitHub repo", async () => {
        it("dummy", async () => {
            assert(true);
        });
    });
});
