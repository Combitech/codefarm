"use strict";

/* global describe it before after */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

describe("BaselineGen", () => {
    describe("Baselines", () => {
        let testInfo;
        let main;

        before(async () => {
            testInfo = {
                name: "baselinegen-baselines",
                version: "0.0.1",
                config: {
                    autoUseMgmt: false,
                    level: "debug",
                    web: {
                        port: await getPort()
                    },
                    db: {
                        testMode: true
                    },
                    bus: {
                        testMode: true
                    },
                    servicecom: {
                        testMode: true
                    }
                }
            };

            main = new Main(testInfo.name, testInfo.version);
            serviceMgr.create(main, testInfo.config);
            await main.awaitOnline();
        });

        after(async () => {
            await serviceMgr.dispose();
        });

        const assertBaseline = (collector) => {
            assert.equal(collector.name, "for-cg");
            assert.equal(collector.content[0]._ref, true);
            assert.equal(collector.content[0].name, "commit");
            assert.equal(collector.content[0].type, "coderepo.revision");
            assert.equal(collector.content[0].id[0], "123");
        };

        it("shall request baselines and get an empty list", async () => {
            const baselines = await rp({
                url: `http://localhost:${testInfo.config.web.port}/baseline`,
                json: true
            });

            assert.equal(baselines.length, 0);
        });

        it("shall add a commit baseline specification", async () => {
            const result = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/specification`,
                json: true,
                body: {
                    _id: "for-cg",
                    collectors: [
                        {
                            name: "commit",
                            collectType: "coderepo.revision",
                            criteria: "!cg",
                            limit: 1,
                            latest: false
                        }
                    ]
                }
            });

            assert.equal(result.result, "success");
        });

        it("shall inject a matching event", async () => {
            const mb = serviceMgr.msgBus;

            const message = await mb.emitEvent([], "created", "coderepo.revision", null, {
                _id: "123",
                tags: []
            });

            await mb.emit("data", message, null, () => {});
        });

        it("shall request a baseline generation", async () => {
            const result = await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg/request`,
                json: true
            });

            assert.equal(result.result, "success");
        });

        it("shall request baselines and get one back", async () => {
            const baselines = await rp({
                url: `http://localhost:${testInfo.config.web.port}/baseline`,
                json: true
            });

            assert.equal(baselines.length, 1);
            assertBaseline(baselines[0]);
        });
    });
});
