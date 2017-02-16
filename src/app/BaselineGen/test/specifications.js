"use strict";

/* global describe it before after */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

describe("BaselineGen", () => {
    describe("Specifications", () => {
        let testInfo;
        let main;

        before(async () => {
            testInfo = {
                name: "baselinegen-specification",
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

        const assertSpecification = (specification) => {
            assert.equal(specification._id, "for-cg");
            assert.equal(specification.collectors[0].name, "commit");
            assert.equal(specification.collectors[0].collectType, "coderepo.revision");
            assert.equal(specification.collectors[0].criteria, "!cg");
            assert.equal(specification.collectors[0].limit, 1);
            assert.equal(specification.collectors[0].latest, false);
        };

        const assertSpecification2 = (specification) => {
            assert.equal(specification._id, "for-cg");
            assert.equal(specification.collectors[0].name, "commit2");
            assert.equal(specification.collectors[0].collectType, "coderepo.revision2");
            assert.equal(specification.collectors[0].criteria, "!cg2");
            assert.equal(specification.collectors[0].limit, 1);
            assert.equal(specification.collectors[0].latest, false);
        };

        it("shall request specifications and get an empty list", async () => {
            const specifications = await rp({
                url: `http://localhost:${testInfo.config.web.port}/specification`,
                json: true
            });

            assert.equal(specifications.length, 0);
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
            assertSpecification(result.data);
        });

        it("shall request specifications and get one back", async () => {
            const specifications = await rp({
                url: `http://localhost:${testInfo.config.web.port}/specification`,
                json: true
            });

            assert.equal(specifications.length, 1);
            assertSpecification(specifications[0]);
        });

        it("shall request a specification by id and get one back", async () => {
            const specification = await rp({
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg`,
                json: true
            });

            assertSpecification(specification);
        });

        it("shall update a commit baseline", async () => {
            const result = await rp({
                method: "PATCH",
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg`,
                json: true,
                body: {
                    collectors: [
                        {
                            name: "commit2",
                            collectType: "coderepo.revision2",
                            criteria: "!cg2",
                            limit: 1,
                            latest: false
                        }
                    ]
                }
            });

            assert.equal(result.result, "success");
            assertSpecification2(result.data);
        });

        it("shall request a specification by name and get an updated one back", async () => {
            const specification = await rp({
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg`,
                json: true
            });

            assertSpecification2(specification);
        });

        it("shall delete a specification", async () => {
            const result = await rp({
                method: "DELETE",
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg`,
                json: true
            });

            assert.equal(result.result, "success");
            assertSpecification2(result.data);
        });
    });
});
