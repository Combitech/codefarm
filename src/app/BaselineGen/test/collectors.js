"use strict";

/* global describe it before after */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

describe("BaselineGen", () => {
    describe("Collectors", () => {
        let testInfo;
        let main;

        before(async () => {
            testInfo = {
                name: "baselinegen-collectors",
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

        const assertCollector = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "!cg");
            assert.equal(collector.limit, 1);
            assert.equal(collector.latest, false);
        };

        it("shall request collectors and get an empty list", async () => {
            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 0);
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

        it("shall request collectors and get one back", async () => {
            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 1);
            assertCollector(collectors[0]);
        });
    });
});
