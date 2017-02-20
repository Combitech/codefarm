"use strict";

/* global describe it beforeEach afterEach */

const { assert } = require("chai");
const sinon = require("sinon");
const os = require("os");
const deepAssign = require("deep-assign");
const { pollUntil: pollUntilBase } = require("testsupport");
const clone = require("clone");
const { HttpClient } = require("servicecom");
const { Service, ServiceMgr } = require("../index");
const { Deferred } = require("misc");

// Redefine pollUntil to poll faster
const pollUntil = async (asyncCond) => pollUntilBase(asyncCond, 20, 25);

class MgmtBusStub {
    constructor() {
        this.publishedMessages = [];
    }

    async consumePublishedMsg(event) {
        this.publishedMessages.push(event);
    }

    async injectMessage(message) {
        console.log(`injectMessage: message=${JSON.stringify(message)}`);
        await this.emitter.emit("data", message, message, () => {
        });

        return message;
    }

    async injectMgmtOnlineMessage(configUri) {
        return this.injectMessage({
            event: "snapshot",
            type: "mgmt.state",
            olddata: null,
            newdata: {
                name: "mgmt",
                state: "ONLINE",
                uses: {},
                provides: {
                    "REST": {
                        uri: configUri
                    }
                }
            }
        });
    }

    async injectMgmtConfigUpdateMessage(oldconfig) {
        // ServiceMgr listens to event: "updated", type: "mgmt.config" and
        // tag "active" removed.
        const oldInactiveConfig = clone(oldconfig);
        oldInactiveConfig.tags = [];

        return this.injectMessage({
            event: "updated",
            type: "mgmt.config",
            olddata: oldconfig,
            newdata: oldInactiveConfig
        });
    }

    setEmitter(emitter) {
        this.emitter = emitter;
        this.emitter.addListener("publish", this.consumePublishedMsg.bind(this));
    }

    get messages() {
        return this.publishedMessages;
    }

    getMessage() {
        return this.publishedMessages.shift();
    }

    reset() {
        this.publishedMessages.length = 0;
    }
}

const mgmtBusStub = new MgmtBusStub();

let configDeferred = new Deferred();

const mgmtConfigResponder = async (opts) => {
    console.log(`mgmtConfigResponder: opts=${JSON.stringify(opts)}`);

    assert.strictEqual(opts.uri, "http://localhost:1234/config");
    assert.deepEqual(opts.qs, { name: "Test", tags: "active" });

    return configDeferred.promise;
};

describe("A Service", () => {
    afterEach(async () => {
        mgmtBusStub.reset();
    });

    const testInfo = {
        name: "Test",
        version: "0.0.1",
        args: {
            level: "verbose",
            minRunTime: 0, // Disable restart delay
            bus: {
                uri: "http://localhost:1235",
                testMode: true,
                testPeekEventEmitter: mgmtBusStub.setEmitter.bind(mgmtBusStub)
            },
            mgmtCfg: {
                testMode: false, // Setting true results in mgmtCfg going online at startup
                testResponder: mgmtConfigResponder
            }
        },
        configUriPart1: "http://localhost:1234",
        remoteConfig: {
            _id: "test-config",
            tags: [ "active" ],
            testConfig: {
                data: "deadbeaf",
                data2: "param1",
                data3: {
                    param: "test"
                }
            }
        }
    };

    let expectedConnectMsg = {
        event: "snapshot",
        type: `${testInfo.name}.state`,
        olddata: null,
        newdata: {
            type: `${testInfo.name}.state`,
            tags: [],
            refs: [],
            comments: [],
            saved: false,
            name: testInfo.name,
            state: "CONNECTED",
            uses: {
                mgmtCfg: {
                    name: "mgmt",
                    dependencyType: "need",
                    type: "REST",
                    state: "NOT_CREATED"
                }
            },
            provides: {},
            status: {}
        },
        parentIds: [],
        source: {
            "hostname": os.hostname()
        }
    };

    const verifyConnectedMessage = (baseMessage, extraProps) => {
        const msg = mgmtBusStub.getMessage();
        assert.property(msg, "_id");
        assert.property(msg, "time");
        const expectedMsg = clone(baseMessage);
        expectedMsg._id = msg._id;
        expectedMsg.time = msg.time;
        expectedMsg.newdata._id = msg.newdata._id;
        expectedMsg.newdata.created = msg.newdata.created;
        expectedMsg.newdata.state = "CONNECTED";
        expectedMsg.newdata.uses.mgmtCfg.state = "NOT_CREATED";
        expectedMsg.parentIds = [];
        if (extraProps) {
            deepAssign(expectedMsg, extraProps);
        }
        assert.strictEqual(msg.event, expectedMsg.event);
        assert.strictEqual(msg.type, expectedMsg.type);
        assert.deepEqual(msg.parentIds, expectedMsg.parentIds);
        assert.deepEqual(msg.newdata, expectedMsg.newdata);

        return expectedMsg;
    };

    const verifySetupMessage = (baseMessage, extraProps) => {
        const msg = mgmtBusStub.getMessage();
        // Verify init message
        assert.property(msg, "_id");
        assert.property(msg, "time");
        const expectedMsg = clone(baseMessage);
        expectedMsg._id = msg._id;
        expectedMsg.time = msg.time;
        expectedMsg.newdata._id = msg.newdata._id;
        expectedMsg.newdata.created = msg.newdata.created;
        expectedMsg.newdata.state = "SETUP";
        expectedMsg.newdata.uses.mgmtCfg.state = "ONLINE";
        expectedMsg.parentIds = [];
        if (extraProps) {
            deepAssign(expectedMsg, extraProps);
        }
        assert.strictEqual(msg.event, expectedMsg.event);
        assert.strictEqual(msg.type, expectedMsg.type);
        assert.deepEqual(msg.parentIds, expectedMsg.parentIds);
        assert.deepEqual(msg.newdata, expectedMsg.newdata);

        return expectedMsg;
    };

    const verifyOnlineMessage = (baseMessage, extraProps) => {
        const msg = mgmtBusStub.getMessage();
        // Verify online message
        assert.property(msg, "_id");
        assert.property(msg, "time");
        const expectedMsg = clone(baseMessage);
        expectedMsg._id = msg._id;
        expectedMsg.time = msg.time;
        expectedMsg.newdata._id = msg.newdata._id;
        expectedMsg.newdata.created = msg.newdata.created;
        expectedMsg.newdata.state = "ONLINE";
        expectedMsg.newdata.uses.mgmtCfg.state = "ONLINE";
        expectedMsg.parentIds = [];
        if (extraProps) {
            deepAssign(expectedMsg, extraProps);
        }
        assert.strictEqual(msg.event, expectedMsg.event);
        assert.strictEqual(msg.type, expectedMsg.type);
        assert.deepEqual(msg.parentIds, expectedMsg.parentIds);
        assert.deepEqual(msg.newdata, expectedMsg.newdata);

        return expectedMsg;
    };

    const verifyOfflineMessage = (baseMessage, extraProps) => {
        const msg = mgmtBusStub.getMessage();

        // Verify offline message
        assert.property(msg, "_id");
        assert.property(msg, "time");
        const expectedMsg = clone(baseMessage);
        expectedMsg._id = msg._id;
        expectedMsg.time = msg.time;
        expectedMsg.newdata._id = msg.newdata._id;
        expectedMsg.newdata.created = msg.newdata.created;
        expectedMsg.newdata.state = "OFFLINE";
        expectedMsg.parentIds = [];
        if (extraProps) {
            deepAssign(expectedMsg, extraProps);
        }
        assert.strictEqual(msg.event, expectedMsg.event);
        assert.strictEqual(msg.type, expectedMsg.type);
        assert.deepEqual(msg.parentIds, expectedMsg.parentIds);
        assert.deepEqual(msg.newdata, expectedMsg.newdata);

        return expectedMsg;
    };

    describe("without dependencies", () => {
        let onSetupSpy;
        let onOnlineSpy;
        let onOfflineSpy;
        let onConfigUpdateSpy;
        let testService1;
        let mgr;
        let createPromise;

        beforeEach(async () => {
            class TestService extends Service {
                constructor(name, version) {
                    super(name, version);
                }
            }

            onSetupSpy = sinon.spy(TestService.prototype, "onSetup");
            onOnlineSpy = sinon.spy(TestService.prototype, "onOnline");
            onOfflineSpy = sinon.spy(TestService.prototype, "onOffline");
            onConfigUpdateSpy = sinon.spy(TestService.prototype, "onConfigUpdate");

            testService1 = new TestService(testInfo.name, testInfo.version);

            // Setup Mgmt stub for returning configuration
            configDeferred = new Deferred();

            mgr = new ServiceMgr();
            const args = clone(testInfo.args);
            createPromise = mgr.create(testService1, args);
            // Wait until connected message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);

            // Verify that service is waiting for configuration and hasn't
            // proceeded to onSetup
            assert.isFalse(onSetupSpy.called, "onSetup called before config received");
            assert.isFalse(onOnlineSpy.called, "onOnline called before config received");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");
            assert.isFalse(onConfigUpdateSpy.called, "onConfigUpdateSpy called before config received");

            // Check that config has been initiated correctly
            assert.notProperty(testService1.config, "testConfig");

            // Check that connect message has been sent
            expectedConnectMsg._id = null;
            expectedConnectMsg.parentIds = [];
            expectedConnectMsg = verifyConnectedMessage(expectedConnectMsg);
        });

        it("should create and wait for config", async () => {
            await mgr.dispose();
            await createPromise;
            assert.isFalse(onSetupSpy.called, "onSetup not called but config received");
            assert.isFalse(onOnlineSpy.called, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(expectedConnectMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "NOT_CREATED"
                        }
                    }
                }
            });
        });

        it("should create and go online when config received", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            configDeferred.resolve([ clone(testInfo.remoteConfig) ]);

            await testService1.awaitOnline();
            assert.isTrue(onSetupSpy.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that config has been initiated correctly
            assert.property(testService1.config, "testConfig");
            assert.deepEqual(testService1.config.testConfig, testInfo.remoteConfig.testConfig);

            // Check that init and online messages has been sent
            const expectedSetupMsg = verifySetupMessage(expectedConnectMsg);
            // Wait until online message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            const expectedOnlineMsg = verifyOnlineMessage(expectedSetupMsg);

            await mgr.dispose();
            await createPromise;
            assert.isTrue(onSetupSpy.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(expectedOnlineMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "ONLINE"
                        }
                    }
                }
            });
        });

        it("should reconfigure log level without restart", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            const oldConfig = clone(testInfo.remoteConfig);
            configDeferred.resolve([ oldConfig ]);

            await testService1.awaitOnline();
            assert.isTrue(onSetupSpy.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");
            assert.isFalse(onConfigUpdateSpy.called, "onConfigUpdate called before config received");

            // Check that config has been initiated correctly
            assert.property(testService1.config, "testConfig");
            assert.deepEqual(testService1.config.testConfig, testInfo.remoteConfig.testConfig);

            // Check that init and online messages has been sent
            const expectedSetupMsg = verifySetupMessage(expectedConnectMsg);
            // Wait until online message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            const expectedOnlineMsg = verifyOnlineMessage(expectedSetupMsg);

            // Setup requestStub to return a new config with reconfigured log level
            const newConfig = clone(testInfo.remoteConfig);
            newConfig._id = "temporary-config-with-log-level-change";
            newConfig.level = newConfig.level === "info" ? "verbose" : "info";
            configDeferred = new Deferred();
            configDeferred.resolve([ newConfig ]);

            await mgmtBusStub.injectMgmtConfigUpdateMessage(oldConfig);

            await testService1.awaitConfigUpdate();
            assert.strictEqual(testService1.config.level, newConfig.level);
            assert.isTrue(onConfigUpdateSpy.calledOnce, "onConfigUpdate not called at config change");

            // Reconfigure log level back
            oldConfig.level = newConfig.level === "info" ? "verbose" : "info";
            configDeferred = new Deferred();
            configDeferred.resolve([ oldConfig ]);

            await mgmtBusStub.injectMgmtConfigUpdateMessage(newConfig);
            assert.strictEqual(testService1.config.level, oldConfig.level);

            await mgr.dispose();
            await createPromise;
            assert.isTrue(onSetupSpy.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");
            assert.strictEqual(onConfigUpdateSpy.callCount, 2, "onConfigUpdate not called correctly");

            // Check offline message
            verifyOfflineMessage(expectedOnlineMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "ONLINE"
                        }
                    }
                }
            });
        });

        it("should restart if config is reconfigured but not handled by service", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            const oldConfig = clone(testInfo.remoteConfig);
            configDeferred.resolve([ oldConfig ]);

            await testService1.awaitOnline();
            assert.isTrue(onSetupSpy.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");
            assert.isFalse(onConfigUpdateSpy.called, "onConfigUpdateSpy called before config received");

            // Check that config has been initiated correctly
            assert.property(testService1.config, "testConfig");
            assert.deepEqual(testService1.config.testConfig, testInfo.remoteConfig.testConfig);

            // Check that init and online messages has been sent
            let lastMsg = verifySetupMessage(expectedConnectMsg);
            // Wait until online message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            lastMsg = verifyOnlineMessage(lastMsg);

            // Setup requestStub to return a new config with reconfigured log level
            const newConfig = clone(testInfo.remoteConfig);
            newConfig._id = "temporary-config-with-testConfig.data-change";
            newConfig.testConfig.data = "UPDATED!!!";
            configDeferred = new Deferred();
            configDeferred.resolve([ newConfig ]);

            assert.isFalse(onConfigUpdateSpy.called, "onConfigUpdateSpy called before config received");
            await mgmtBusStub.injectMgmtConfigUpdateMessage(oldConfig);

            // We cannot inject mgmt online message until we have restarted,
            // wait for offline and the nconnect to make sure that restart
            // has completed.
            await testService1.awaitOffline();
            await testService1.awaitConnect();

            assert.isTrue(onConfigUpdateSpy.calledOnce, "onConfigUpdateSpy not called");

            // Prepare config to use when mgmtCfg goes online
            const newConfig2 = clone(testInfo.remoteConfig);
            newConfig2._id = "new-config";
            newConfig2.testConfig.data = "restored";
            configDeferred = new Deferred();
            configDeferred.resolve([ newConfig2 ]);

            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            await testService1.awaitOnline();

            // Make sure correct config is used
            assert.strictEqual(testService1.config.testConfig.data, newConfig2.testConfig.data);

            lastMsg = verifyOfflineMessage(lastMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "ONLINE"
                        }
                    }
                }
            });

            lastMsg = verifyConnectedMessage(lastMsg);
            lastMsg = verifySetupMessage(lastMsg);

            await mgr.dispose();
            await createPromise;
            assert.strictEqual(onSetupSpy.callCount, 2, "onSetup not called but config received");
            assert.strictEqual(onOnlineSpy.callCount, 2, "onOnline not called but dependencies up");
            assert.strictEqual(onOfflineSpy.callCount, 2, "onOffline not called after dispose");
            assert.isTrue(onConfigUpdateSpy.calledOnce, "onConfigUpdateSpy not called");

            lastMsg = verifyOnlineMessage(lastMsg);
            verifyOfflineMessage(lastMsg);
        });

        it("should create and restart if config rejects", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            configDeferred.reject("Expected reject to mimic no response from server");
            await testService1.awaitOffline();

            // Check that config has been initiated correctly
            assert.notProperty(testService1.config, "testConfig");

            // When config fails, service is restarted
            await pollUntil(async () => mgmtBusStub.messages.length >= 2);

            assert.strictEqual(mgmtBusStub.messages.length, 2);
            // Check offline message
            const offlineMsg = verifyOfflineMessage(expectedConnectMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "ONLINE"
                        }
                    }
                }
            });
            const connectMsg = verifyConnectedMessage(offlineMsg);
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called during restart");
            onOfflineSpy.reset();

            await mgr.dispose();
            await createPromise;
            assert.isFalse(onSetupSpy.called, "onSetup not called but config received");
            assert.isFalse(onOnlineSpy.called, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(connectMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "NOT_CREATED"
                        }
                    }
                }
            });
        });

        it("should create and restart if multiple active configs", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);
            const configs = [
                clone(testInfo.remoteConfig),
                {
                    "other_active_config": true
                }
            ];
            configDeferred.resolve(configs);
            await testService1.awaitOffline();

            // Check that config has been initiated correctly
            assert.notProperty(testService1.config, "testConfig");

            // When config fails, service is restarted
            await pollUntil(async () => mgmtBusStub.messages.length >= 2);

            assert.strictEqual(mgmtBusStub.messages.length, 2);
            // Check offline message
            const offlineMsg = verifyOfflineMessage(expectedConnectMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "ONLINE"
                        }
                    }
                }
            });
            const connectMsg = verifyConnectedMessage(offlineMsg);
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called during restart");
            onOfflineSpy.reset();

            await mgr.dispose();
            await createPromise;
            assert.isFalse(onSetupSpy.called, "onSetup not called but config received");
            assert.isFalse(onOnlineSpy.called, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(connectMsg, {
                newdata: {
                    uses: {
                        mgmtCfg: {
                            state: "NOT_CREATED"
                        }
                    }
                }
            });
        });
    });

    describe("that have dependencies", () => {
        let TestService;
        let onSetupStub;
        let onOnlineSpy;
        let onOfflineSpy;
        let testService1;
        let mgr;
        let createPromise;

        const restDepId = "DEP1";
        const restDepOnlineMessage = {
            name: "RemoteService",
            state: "ONLINE",
            uses: {},
            provides: {
                "REST": {
                    uri: "http://host:1234"
                }
            }
        };

        beforeEach(async () => {
            class TestServiceClass extends Service {
                constructor(name, version) {
                    super(name, version);
                }
            }
            TestService = TestServiceClass;

            onSetupStub = sinon.stub(TestService.prototype, "onSetup", /* @this Service */ async function() {
                await this.need(restDepId, restDepOnlineMessage.name, HttpClient);
            });
            onOnlineSpy = sinon.spy(TestService.prototype, "onOnline");
            onOfflineSpy = sinon.spy(TestService.prototype, "onOffline");

            testService1 = new TestService(testInfo.name, testInfo.version);

            // Setup Mgmt stub for returning configuration
            configDeferred = new Deferred();

            mgr = new ServiceMgr();
            const args = clone(testInfo.args);
            createPromise = mgr.create(testService1, args);
            await pollUntil(async () => mgmtBusStub.messages.length > 0);

            // Verify that service is waiting for configuration and hasn't
            // proceeded to onSetup
            assert.isFalse(onSetupStub.called, "onSetup called before config received");
            assert.isFalse(onOnlineSpy.called, "onOnline called before config received");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that config has been initiated correctly
            assert.notProperty(testService1.config, "testConfig");

            // Check that connect message has been sent
            expectedConnectMsg._id = null;
            expectedConnectMsg.parentIds = [];
            expectedConnectMsg = verifyConnectedMessage(expectedConnectMsg);
        });

        it("should go online when config received and REST dependency online", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            configDeferred.resolve([ clone(testInfo.remoteConfig) ]);

            await testService1.awaitSetup();
            assert.isTrue(onSetupStub.calledOnce, "onSetup not called but config received");
            assert.isFalse(onOnlineSpy.called, "onOnline called but dependencies not up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that config has been initiated correctly
            assert.property(testService1.config, "testConfig");
            assert.deepEqual(testService1.config.testConfig, testInfo.remoteConfig.testConfig);

            // Check that init message has been sent
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            const expectedSetupMsg = verifySetupMessage(expectedConnectMsg, {
                newdata: {
                    uses: {
                        DEP1: {
                            name: restDepOnlineMessage.name,
                            dependencyType: "need",
                            type: "REST",
                            state: "NOT_CREATED"
                        }
                    }
                }
            });

            // Signal dependency online providing REST service
            await mgmtBusStub.injectMessage({
                event: "snapshot",
                type: "RemoteService.state",
                olddata: null,
                newdata: restDepOnlineMessage
            });

            await testService1.awaitOnline();
            assert.isTrue(onSetupStub.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that online message has been sent
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            const expectedOnlineMsg = verifyOnlineMessage(expectedSetupMsg, {
                newdata: {
                    uses: {
                        DEP1: {
                            state: "ONLINE"
                        }
                    }
                }
            });

            // Check that service can be used
            const restClient = await testService1.use(restDepId);

            assert.strictEqual(restClient.config.uri, restDepOnlineMessage.provides.REST.uri);

            await mgr.dispose();
            await createPromise;
            assert.isTrue(onSetupStub.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(expectedOnlineMsg);
        });
    });

    describe("that provides a service", () => {
        let onSetupStub;
        let onOnlineSpy;
        let onOfflineSpy;
        let testService1;
        let mgr;
        let createPromise;

        const provides = {
            "REST": {
                uri: "http://localhost:4567"
            }
        };

        beforeEach(async () => {
            class TestService extends Service {
                constructor(name, version) {
                    super(name, version);
                }
            }

            onSetupStub = sinon.stub(TestService.prototype, "onSetup", /* @this Service */ async function() {
                await this.provide("REST", provides.REST);
            });
            onOnlineSpy = sinon.spy(TestService.prototype, "onOnline");
            onOfflineSpy = sinon.spy(TestService.prototype, "onOffline");

            testService1 = new TestService(testInfo.name, testInfo.version);

            // Setup Mgmt stub for returning configuration
            configDeferred = new Deferred();

            mgr = new ServiceMgr();
            const args = clone(testInfo.args);
            createPromise = mgr.create(testService1, args);
            // Wait until connected message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);

            // Verify that service is waiting for configuration and hasn't
            // proceeded to onSetup
            assert.isFalse(onSetupStub.called, "onSetup called before config received");
            assert.isFalse(onOnlineSpy.called, "onOnline called before config received");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that config has been initiated correctly
            assert.notProperty(testService1.config, "testConfig");

            // Check that connect message has been sent
            expectedConnectMsg._id = null;
            expectedConnectMsg.parentIds = [];
            expectedConnectMsg = verifyConnectedMessage(expectedConnectMsg);
        });

        it("should create and go online when config received", async () => {
            // Signal Mgmt online providing config REST service
            await mgmtBusStub.injectMgmtOnlineMessage(testInfo.configUriPart1);

            configDeferred.resolve([ clone(testInfo.remoteConfig) ]);

            await testService1.awaitOnline();
            assert.isTrue(onSetupStub.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isFalse(onOfflineSpy.called, "onOffline called before config received");

            // Check that config has been initiated correctly
            assert.property(testService1.config, "testConfig");
            assert.deepEqual(testService1.config.testConfig, testInfo.remoteConfig.testConfig);

            // Check that init and online messages has been sent
            const expectedSetupMsg = verifySetupMessage(expectedConnectMsg, {
                newdata: {
                    provides: provides
                }
            });
            // Wait until online message published
            await pollUntil(async () => mgmtBusStub.messages.length > 0);
            const expectedOnlineMsg = verifyOnlineMessage(expectedSetupMsg);

            await mgr.dispose();
            await createPromise;
            assert.isTrue(onSetupStub.calledOnce, "onSetup not called but config received");
            assert.isTrue(onOnlineSpy.calledOnce, "onOnline not called but dependencies up");
            assert.isTrue(onOfflineSpy.calledOnce, "onOffline not called after dispose");

            // Check offline message
            verifyOfflineMessage(expectedOnlineMsg);
        });
    });
});
