"use strict";

/* global describe it after before beforeEach */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const clone = require("clone");
const sift = require("sift");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

class MsgBusStub {
    constructor() {
    }

    async injectMessage(message) {
        await this.emitter.emit("data", message, message, () => {
        });

        return message;
    }

    async injectTypeUpdateMessage(type, id) {
        return this.injectMessage({
            event: "updated",
            type: type,
            typeId: id,
            parentIds: [],
            olddata: {},
            newdata: {}
        });
    }

    setEmitter(emitter) {
        this.emitter = emitter;
        // To listen to messages, install a listener for the publish event
        // this.emitter.addListener("publish", this.consumePublishedMsg.bind(this));
    }
}

const msgBusStub = new MsgBusStub();

describe("DataResolve", () => {
    describe("Resolve", () => {
        let testInfo;
        let main;

        const testData = [];
        const requestedRefs = [];

        before(async () => {
            testInfo = {
                name: "dataresolve",
                version: "0.0.1",
                config: {
                    autoUseMgmt: false,
                    level: "info",
                    bus: {
                        testMode: true,
                        testPeekEventEmitter: msgBusStub.setEmitter.bind(msgBusStub)
                    },
                    db: {
                        testMode: true
                    },
                    web: {
                        port: await getPort()
                    },
                    resolver: {
                        testMode: true,
                        getTestData: (ref, sourceId) => {
                            requestedRefs.push({
                                requesterId: sourceId,
                                ref: clone(ref)
                            });
                            if (ref.id.constructor === Array) {
                                return clone(testData.filter((data) => data.type === ref.type && ref.id.includes(data._id)));
                            }

                            return clone(testData.find((data) => data.type === ref.type && ref.id === data._id));
                        },
                        getTestDataList: (type, query) => {
                            const typeList = testData.filter((data) => data.type === type);
                            const matches = sift(query, typeList);

                            return clone(matches);
                        }
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


        beforeEach(async () => {
            requestedRefs.length = 0;
        });

        const resolve = (resolver, opts) => rp({
            method: "POST",
            url: `http://localhost:${testInfo.config.web.port}/data`,
            json: true,
            body: {
                resolver: resolver,
                opts: opts
            }
        });

        const getResolved = (id) => rp({
            method: "GET",
            url: `http://localhost:${testInfo.config.web.port}/data/${id}`,
            json: true
        });

        describe("RefResolve", async () => {
            const dataParent = {
                _id: "0",
                type: "service.type",
                value: "hello0",
                refs: [
                    {
                        _ref: true,
                        name: "child1",
                        id: "1",
                        type: "service.type"
                    }
                ],
                child2: {
                    _ref: true,
                    id: "2",
                    type: "service.type"
                },
                children: {
                    _ref: true,
                    id: [ "1", "2" ],
                    type: "service.type"
                }
            };

            const dataChild1 = {
                _id: "1",
                type: "service.type",
                value: "hello1"
            };

            const dataChild2 = {
                _id: "2",
                type: "service.type",
                child1: {
                    _ref: true,
                    id: "1",
                    type: "service.type"
                },
                value: "hello2"
            };

            before(() => {
                testData.length = 0;
                testData.push(dataParent, dataChild1, dataChild2);
            });

            beforeEach(async () => {
                dataChild1.value = "hello1";
            });

            const assertRef = (data, resolved = false) => {
                assert.equal(data._ref, true);
                assert.isString(data.type, true);
                assert.isDefined(data.id);

                if (data.id.constructor !== String) {
                    assert.isArray(data.id);
                }

                assert.isAtLeast(data.id.length, 1);

                if (resolved) {
                    if (data.id.constructor === String) {
                        assert.isObject(data.data);
                    } else {
                        assert.isArray(data.data);
                    }
                } else {
                    assert.isUndefined(data.data);
                }
            };

            describe("Test Resolve REST (HTTP) API", () => {
                it("should get a single object", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.isUndefined(obj.opts.spec);
                    assert.deepEqual(obj.watchRefs, [ ref ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.child2);
                    assertRef(obj.data.refs[0]);
                });

                it("should get a multiple objects", async () => {
                    const ref = {
                        _ref: true,
                        id: [ "0", "1", "2" ],
                        type: "service.type"
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.isUndefined(obj.opts.spec);
                    assert.deepEqual(obj.watchRefs, [ ref ]);
                    assert.equal(obj.data.length, 3);
                    assert.equal(obj.data[0].value, "hello0");
                    assert.equal(obj.data[1].value, "hello1");
                    assert.equal(obj.data[2].value, "hello2");
                });

                it("should get a single object and resolve refs list", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.refs[*]"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.refs[0] ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.child2);
                    assertRef(obj.data.refs[0], true);
                    assert.equal(obj.data.refs[0].data.value, "hello1");
                });

                it("should get a single object and resolve named ref", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.child2"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.child2 ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.refs[0]);
                    assertRef(obj.data.child2, true);
                    assert.equal(obj.data.child2.data.value, "hello2");
                    assertRef(obj.data.child2.data.child1);
                });

                it("should get a single object and resolve named ref and one subref", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.child2",
                            "$.child2.data.child1"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.child2, dataChild2.child1 ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.refs[0]);
                    assertRef(obj.data.child2, true);
                    assert.equal(obj.data.child2.data.value, "hello2");
                    assertRef(obj.data.child2.data.child1, true);
                    assert.equal(obj.data.child2.data.child1.data.value, "hello1");
                });

                it("should get a single object and resolve a multi id ref", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.children"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.children ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.refs[0]);
                    assertRef(obj.data.child2);
                    assertRef(obj.data.children, true);
                    assert.equal(obj.data.children.data.length, 2);
                    assert.equal(obj.data.children.data[0].value, "hello1");
                    assert.equal(obj.data.children.data[1].value, "hello2");
                });
            });

            describe("Test updates of watched refs", () => {
                it("should get a single object and resolve refs list", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.refs[*]"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.refs[0] ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.child2);
                    assertRef(obj.data.refs[0], true);
                    assert.equal(obj.data.refs[0].data.value, "hello1");
                    const id = obj._id;

                    const expectedRequestedRefs = [
                        ref,
                        clone(obj.data.refs[0])
                    ];
                    delete expectedRequestedRefs[1].data;
                    assert.deepEqual(
                        requestedRefs.filter((item) => item.requesterId === id).map((item) => item.ref),
                        expectedRequestedRefs
                    );

                    // Reset requestedRefs
                    requestedRefs.length = 0;

                    // Perform update
                    dataChild1.value = "goodbye1";
                    await msgBusStub.injectTypeUpdateMessage(obj.data.refs[0].type, obj.data.refs[0].id);

                    // Remove root ref which is already resolved and shall not be resolved again
                    expectedRequestedRefs.shift();
                    assert.deepEqual(
                        requestedRefs.filter((item) => item.requesterId === id).map((item) => item.ref),
                        expectedRequestedRefs
                    );

                    const updatedObj = await getResolved(id);
                    assert.strictEqual(updatedObj._id, id);
                    assertRef(updatedObj.data.refs[0], true);
                    assert.strictEqual(updatedObj.data.refs[0].data.value, "goodbye1");
                });

                it("should get a single object and resolve named ref and one subref", async () => {
                    const ref = {
                        _ref: true,
                        id: "0",
                        type: "service.type"
                    };
                    const spec = {
                        paths: [
                            "$.child2",
                            "$.child2.data.child1"
                        ]
                    };

                    const result = await resolve("RefResolve", {
                        ref: ref,
                        spec: spec
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.ref, ref);
                    assert.deepEqual(obj.opts.spec, spec);
                    assert.deepEqual(obj.watchRefs, [ ref, dataParent.child2, dataChild2.child1 ]);
                    assert.equal(obj.data._id, "0");
                    assert.equal(obj.data.type, "service.type");
                    assert.equal(obj.data.value, "hello0");
                    assertRef(obj.data.refs[0]);
                    assertRef(obj.data.child2, true);
                    assert.equal(obj.data.child2.data.value, "hello2");
                    assertRef(obj.data.child2.data.child1, true);
                    assert.equal(obj.data.child2.data.child1.data.value, "hello1");

                    const id = obj._id;

                    const expectedRequestedRefs = [
                        ref,
                        clone(obj.data.child2),
                        clone(obj.data.child2.data.child1)
                    ];
                    delete expectedRequestedRefs[1].data;
                    delete expectedRequestedRefs[2].data;
                    assert.deepEqual(
                        requestedRefs.filter((item) => item.requesterId === id).map((item) => item.ref),
                        expectedRequestedRefs
                    );

                    // Reset requestedRefs
                    requestedRefs.length = 0;

                    // Perform update
                    dataChild1.value = "nested1";
                    const child1Ref = obj.data.child2.data.child1;
                    await msgBusStub.injectTypeUpdateMessage(child1Ref.type, child1Ref.id);

                    // Remove root and child2 ref which is already resolved and shall not be resolved again
                    expectedRequestedRefs.shift();
                    expectedRequestedRefs.shift();
                    assert.deepEqual(
                        requestedRefs.filter((item) => item.requesterId === id).map((item) => item.ref),
                        expectedRequestedRefs
                    );

                    const updatedObj = await getResolved(id);
                    assert.strictEqual(updatedObj._id, id);
                    assert.strictEqual(updatedObj.data.child2.data.child1.data.value, "nested1");
                });
            });
        });

        describe("BaselineFlowsResolve", async () => {
            const steps = [ {
                _id: "Step1",
                type: "flowctrl.step",
                name: "Step1",
                flow: { id: "Flow1" },
                baseline: { id: "Baseline1" }
            }, {
                _id: "Step2",
                type: "flowctrl.step",
                name: "Step2",
                flow: { id: "Flow1" },
                baseline: { id: "Baseline1" }
            }, {
                _id: "Step3",
                type: "flowctrl.step",
                name: "Step3",
                flow: { id: "Flow1" },
                baseline: { id: "Baseline2" }
            }, {
                _id: "Step4",
                type: "flowctrl.step",
                name: "Step4",
                flow: { id: "Flow2" },
                baseline: { id: "Baseline2" }
            } ];

            const flows = [ {
                _id: "Flow1",
                type: "flowctrl.flow"
            }, {
                _id: "Flow2",
                type: "flowctrl.flow"
            } ];

            before(() => {
                testData.length = 0;
                testData.push(...steps);
                testData.push(...flows);
            });

            beforeEach(async () => {
                steps[0].flow = "Flow1";
            });

            const assertRefWatched = (data, id, type) => data.watchRefs
                .filter((ref) => ref._id === id)
                .forEach((ref) => assert.deepEqual(ref, {
                    _ref: true,
                    _id: id,
                    type: type
                }));

            describe("Test Resolve REST (HTTP) API", () => {
                let bl1DataId;
                it("should resolve a baseline that results in one flow", async () => {
                    const baselineName = "Baseline1";

                    const result = await resolve("BaselineFlowsResolve", {
                        baselineName: baselineName
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.baselineName, baselineName);
                    assert.deepEqual(obj.data, [ flows[0] ]);
                    assertRefWatched(obj, flows[0]._id, flows[0].type);
                    steps.filter((item) => item.baseline === baselineName)
                        .forEach((item) => assertRefWatched(obj, item._id, item.type));
                    bl1DataId = obj._id;
                });

                it("should resolve a baseline that results in multiple flows", async () => {
                    const baselineName = "Baseline2";

                    const result = await resolve("BaselineFlowsResolve", {
                        baselineName: baselineName
                    });

                    assert.equal(result.result, "success");

                    const obj = result.data;

                    assert.deepEqual(obj.opts.baselineName, baselineName);
                    assert.deepEqual(obj.data, [ flows[0], flows[1] ]);
                    assertRefWatched(obj, flows[0]._id, flows[0].type);
                    assertRefWatched(obj, flows[1]._id, flows[1].type);
                    steps.filter((item) => item.baseline === baselineName).forEach((item) =>
                        assertRefWatched(obj, item._id, item.type)
                    );
                });

                it("should update on updated refs", async () => {
                    const baselineName = "Baseline1";

                    // Perform update
                    steps[0].flow = { id: "Flow2" };
                    await msgBusStub.injectTypeUpdateMessage(steps[0].type, steps[0]._id);
                    const obj = await getResolved(bl1DataId);

                    assert.deepEqual(obj.opts.baselineName, baselineName);
                    assert.deepEqual(obj.data, [ flows[0], flows[1] ]);
                    assertRefWatched(obj, flows[0]._id, flows[0].type);
                    assertRefWatched(obj, flows[1]._id, flows[1].type);
                    steps.filter((item) => item.baseline === baselineName).forEach((item) =>
                        assertRefWatched(obj, item._id, item.type)
                    );
                });
            });
        });
    });
});
