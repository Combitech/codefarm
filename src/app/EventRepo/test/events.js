"use strict";

/* global describe it after before */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

describe("EventRepo", () => {
    describe("Events", () => {
        let testInfo;
        let main;

        const eventParent = {
            _id: "1",
            parentIds: []
        };

        const eventChild1 = {
            _id: "2",
            parentIds: [ "1" ]
        };

        const eventChild2 = {
            _id: "3",
            parentIds: [ "1" ]
        };

        before(async () => {
            testInfo = {
                name: "eventrepo",
                version: "0.0.1",
                config: {
                    autoUseMgmt: false,
                    level: "info",
                    bus: {
                        testMode: true
                    },
                    db: {
                        testMode: true,
                        name: "MyDB"
                    },
                    web: {
                        port: await getPort()
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

        describe("Test event REST API", () => {
            it("should list zero events", async () => {
                const data = await rp({
                    url: `http://localhost:${testInfo.config.web.port}/event`,
                    json: true
                });

                assert.equal(data.length, 0);
            });

            it("should inject an event", async () => {
                const mb = serviceMgr.msgBus;
                await mb.emit("data", eventParent, null, () => {});
            });

            it("should list one events", async () => {
                const data = await rp({
                    url: `http://localhost:${testInfo.config.web.port}/event`,
                    json: true
                });

                assert.equal(data.length, 1);
            });

            it("should inject more events", async () => {
                const mb = serviceMgr.msgBus;
                await mb.emit("data", eventChild1, null, () => {});
                await mb.emit("data", eventChild2, null, () => {});
            });

            it("should list three events", async () => {
                const data = await rp({
                    url: `http://localhost:${testInfo.config.web.port}/event`,
                    json: true
                });

                assert.equal(data.length, 3);
            });

            it("should list parent and after", async () => {
                const data = await rp({
                    url: `http://localhost:${testInfo.config.web.port}/event/1/after`,
                    json: true
                });

                assert.equal(data.length, 3);
                assert.deepEqual(data[0], eventParent);
                assert.deepEqual(data[1], eventChild1);
                assert.deepEqual(data[2], eventChild2);
            });

            it("should list child and before", async () => {
                const data = await rp({
                    url: `http://localhost:${testInfo.config.web.port}/event/3/before`,
                    json: true
                });

                assert.equal(data.length, 2);
                assert.deepEqual(data[0], eventChild2);
                assert.deepEqual(data[1], eventParent);
            });
        });
    });
});
