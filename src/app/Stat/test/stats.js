"use strict";

/* global describe it after before */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const Main = require("../lib/main");
const { notification: typeNotification } = require("typelib");

class MsgBusStub {
    constructor() {
    }

    async injectMessage(message) {
        await this.emitter.emit("data", message, message, () => {});

        return message;
    }

    async injectTypeEvent(event, type, id, newdata = {}, olddata = {}) {
        return this.injectMessage({
            event,
            type: type,
            typeId: id,
            parentIds: [],
            olddata,
            newdata
        });
    }

    setEmitter(emitter) {
        this.emitter = emitter;
        // To listen to messages, install a listener for the publish event
        // this.emitter.addListener("publish", this.consumePublishedMsg.bind(this));
    }
}

const msgBusStub = new MsgBusStub();

describe("Stat", () => {
    let testInfo;
    let main;
    let baseUrl;

    const restAdd = async (type, data) =>
        rp.post({
            url: `${baseUrl}/${type}`,
            body: data,
            json: true
        });

    const restList = async (type) =>
        rp({
            url: `${baseUrl}/${type}`,
            json: true
        });

    const restGet = async (type, id, getter = false, qs = false) => {
        let url = `${baseUrl}/${type}/${id}`;
        if (getter) {
            url = `${url}/${getter}`;
        }
        if (qs) {
            url = `${url}?${qs}`;
        }

        return rp({ url, json: true });
    };

    const triggerEvent = async (event, tags, data = {}) => {
        const obj = Object.assign({
            _id: "type-id-1",
            type: "service1.type1",
            tags
        }, data);
        await msgBusStub.injectTypeEvent(
            event,
            obj.type,
            obj._id,
            obj,
            obj
        );
    };

    const waitLastDataSet = async (id) =>
        new Promise((resolve) => {
            const updatedListener = (stat) => {
                if (stat._id === id && stat.lastData !== null) {
                    typeNotification.removeListener("stat.updated", updatedListener);
                    resolve();
                }
            };
            typeNotification.on("stat.updated", updatedListener);
        });

    before(async () => {
        testInfo = {
            name: "stat",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "info",
                bus: {
                    testMode: true,
                    testPeekEventEmitter: msgBusStub.setEmitter.bind(msgBusStub)
                },
                db: {
                    testMode: true,
                    testAggregate: (collection, pipeline, options) => ([
                        // Mimic stat-internal field:op format
                        {
                            "sample:collection": collection,
                            "sample:pipeline": pipeline,
                            "sample:options": options
                        }
                    ]),
                    name: "MyDB"
                },
                web: {
                    port: await getPort()
                },
                servicecom: {
                    testMode: true
                }
            }
        };

        baseUrl = `http://localhost:${testInfo.config.web.port}`;

        main = new Main(testInfo.name, testInfo.version);
        ServiceMgr.instance.create(main, testInfo.config);
        await main.awaitOnline();
    });

    after(async () => {
        await ServiceMgr.instance.dispose();
    });

    const spec1 = {
        _id: "TestSpec",
        description: "Test specification",
        initialState: 10,
        script: `
            value = {
                // Loop back data...
                input: data,
                // Report value to measure on
                sample: data.newdata.sample
            };
            nextState = data.state + 1;
        `
    };

    const stat1 = {
        _id: "stat1",
        samples: [ 10, 10, 20 ]
    };

    describe("with spec", () => {
        it("should initially list no specs", async () => {
            const data = await restList("spec");
            assert.equal(data.length, 0);
        });

        it("should add spec", async () => {
            const data = await restAdd("spec", spec1);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data._id, spec1._id);
            assert.strictEqual(data.data.description, spec1.description);
            assert.strictEqual(data.data.script, spec1.script);
            assert.strictEqual(data.data.initialState, spec1.initialState);
        });

        it("should list specs", async () => {
            const data = await restList("spec");
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, spec1._id);
            assert.strictEqual(data[0].description, spec1.description);
            assert.strictEqual(data[0].script, spec1.script);
            assert.strictEqual(data[0].initialState, spec1.initialState);
        });
    });

    describe("with stat", () => {
        it("should initially list no stats", async () => {
            const data = await restList("stat");
            assert.equal(data.length, 0);
        });

        it("should create stat on type update", async () => {
            const lastDataSetPromise = waitLastDataSet(stat1._id);
            await triggerEvent("updated",
                [ `stat:${spec1._id}:${stat1._id}` ],
                { sample: stat1.samples[0] }
            );
            await lastDataSetPromise;
        });

        it("should get stat", async () => {
            const data = await restGet("stat", stat1._id);

            assert.strictEqual(data._id, stat1._id);
            assert.deepEqual(data.specRef, {
                _ref: true,
                type: "stat.spec",
                id: spec1._id
            });

            // Check that script has updated state
            assert.strictEqual(data.state, spec1.initialState + 1);

            // Check script input and output since script
            assert.strictEqual(data.lastData.input.event, "updated");
            assert.strictEqual(data.lastData.input.state, spec1.initialState);
            assert.strictEqual(data.lastData.input.newdata._id, "type-id-1");
            assert.strictEqual(data.lastData.input.newdata.type, "service1.type1");
            assert.strictEqual(data.lastData.input.newdata.sample, stat1.samples[0]);
            assert.strictEqual(data.lastData.input.spec._id, spec1._id);
            assert.strictEqual(data.lastData.input.stat._id, stat1._id);
        });

        it("should list stats", async () => {
            const data = await restList("stat");
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, stat1._id);
        });

        for (let i = 1; i < stat1.samples.length; ++i) {
            it(`should add sample ${i}`, async () => {
                const lastDataSetPromise = waitLastDataSet(stat1._id);
                await triggerEvent("updated",
                    [ `stat:${spec1._id}:${stat1._id}` ],
                    { sample: stat1.samples[i] }
                );
                await lastDataSetPromise;
            });
        }

        it("should get stat info", async () => {
            const data = await restGet("stat", stat1._id, "info", "field=sample");
            assert.equal(data.length, 1);
            assert.strictEqual(data[0].id, "sample");
            assert.strictEqual(data[0].collection, `statdata_${stat1._id}`);
        });

        it("should get stat samples", async () => {
            const data = await restGet("stat", stat1._id, "samples", "field=sample");
            assert.equal(data.length, stat1.samples.length);
            const samples = data.map((item) => item.sample);
            assert.deepEqual(samples, stat1.samples);
        });
    });
});
