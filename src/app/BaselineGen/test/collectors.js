"use strict";

/* global describe it before after */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const Main = require("../lib/main");
const Collector = require("../lib/types/collector");
const { delay } = require("testsupport");

let lastGeneratedBaselineEvent = {};

class MsgBusStub {
    constructor() {
    }

    async injectMessage(message) {
        await this.emitter.emit("data", message, message, () => {
        });

        return message;
    }

    async injectTypeUpdateMessage(type, id, oldTags, newTags) {
        return this.injectMessage({
            event: "updated",
            type: type,
            typeId: id,
            parentIds: [],
            olddata: {
                tags: oldTags
            },
            newdata: {
                tags: newTags
            }
        });
    }

    async consumePublishedMsg(message) {
        if (message.type.endsWith("baseline")) {
            lastGeneratedBaselineEvent = message;
            // console.log("message", JSON.stringify(message, null, 2));
        }
    }

    setEmitter(emitter) {
        this.emitter = emitter;

        this.emitter.addListener("publish", this.consumePublishedMsg.bind(this));
    }
}

const msgBusStub = new MsgBusStub();

describe("BaselineGen", () => {
    describe("Collectors-limit-0", () => {
        let testInfo;
        let main;

        before(async () => {
            testInfo = {
                name: "baselinegen-collectors-limit-0",
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
                        testMode: true,
                        testPeekEventEmitter: msgBusStub.setEmitter.bind(msgBusStub)
                    },
                    servicecom: {
                        testMode: true
                    }
                }
            };

            main = new Main(testInfo.name, testInfo.version);
            ServiceMgr.instance.create(main, testInfo.config);
            await main.awaitOnline();
        });

        after(async () => {
            await ServiceMgr.instance.dispose();
        });

        const assertCollectorNotReady = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 0);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, []);
            assert.equal(collector.state, Collector.STATES.NOT_READY);
        };

        const assertCollectorReady = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 0);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, [ "abc" ]);
            assert.equal(collector.state, Collector.STATES.READY);
        };

        const assertCollectorUsed = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 0);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, [ "abc" ]);
            assert.equal(collector.state, Collector.STATES.USED);
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
                            criteria: "tag",
                            limit: 0,
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
            assertCollectorNotReady(collectors[0]);
        });

        it("shall inject an event and get two collectors back", async () => {
            await msgBusStub.injectTypeUpdateMessage("coderepo.revision", "abc", [], [ "tag" ]);

            await delay(300);

            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 1);
            assertCollectorReady(collectors[0]);
        });

        it("shall request a baseline get two collectors back", async () => {
            await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg/request`,
                json: true
            });

            await delay(300);

            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 2);
            assertCollectorUsed(collectors[0]);
            assertCollectorNotReady(collectors[1]);

            assert.equal(lastGeneratedBaselineEvent.event, "created");
            assert.equal(lastGeneratedBaselineEvent.olddata, null);
            assert.equal(lastGeneratedBaselineEvent.newdata.content.length, 1);
            assert.deepEqual(lastGeneratedBaselineEvent.newdata.content[0].id, [ "abc" ]);
        });
    });

    describe("Collectors-limit-1", () => {
        let testInfo;
        let main;

        before(async () => {
            testInfo = {
                name: "baselinegen-collectors-limit-1",
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
                        testMode: true,
                        testPeekEventEmitter: msgBusStub.setEmitter.bind(msgBusStub)
                    },
                    servicecom: {
                        testMode: true
                    }
                }
            };

            main = new Main(testInfo.name, testInfo.version);
            ServiceMgr.instance.create(main, testInfo.config);
            await main.awaitOnline();
        });

        after(async () => {
            await ServiceMgr.instance.dispose();
        });

        const assertCollectorNotReady = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 1);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, []);
            assert.equal(collector.state, Collector.STATES.NOT_READY);
        };

        const assertCollectorCompleted = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 1);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, [ "abc" ]);
            assert.equal(collector.state, Collector.STATES.COMPLETED);
        };

        const assertCollectorUsed = (collector) => {
            assert.equal(collector.baseline, "for-cg");
            assert.equal(collector.name, "commit");
            assert.equal(collector.collectType, "coderepo.revision");
            assert.equal(collector.criteria, "tag");
            assert.equal(collector.limit, 1);
            assert.equal(collector.latest, false);
            assert.deepEqual(collector.ids, [ "abc" ]);
            assert.equal(collector.state, Collector.STATES.USED);
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
                            criteria: "tag",
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
            assertCollectorNotReady(collectors[0]);
        });

        it("shall inject an event and get two collectors back", async () => {
            await msgBusStub.injectTypeUpdateMessage("coderepo.revision", "abc", [], [ "tag" ]);

            await delay(300);

            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 2); // TODO!!!
            assertCollectorCompleted(collectors[0]);
            assertCollectorNotReady(collectors[1]);
        });


        it("shall request a baseline get two collectors back", async () => {
            await rp({
                method: "POST",
                url: `http://localhost:${testInfo.config.web.port}/specification/for-cg/request`,
                json: true
            });

            await delay(300);

            const collectors = await rp({
                url: `http://localhost:${testInfo.config.web.port}/collector`,
                json: true
            });

            assert.equal(collectors.length, 2);
            assertCollectorUsed(collectors[0]);
            assertCollectorNotReady(collectors[1]);

            assert.equal(lastGeneratedBaselineEvent.event, "created");
            assert.equal(lastGeneratedBaselineEvent.olddata, null);
            assert.equal(lastGeneratedBaselineEvent.newdata.content.length, 1);
            assert.deepEqual(lastGeneratedBaselineEvent.newdata.content[0].id, [ "abc" ]);
        });
    });
});
