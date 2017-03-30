"use strict";

/* global describe it after before */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { ServiceMgr } = require("service");
const Main = require("../lib/main");

describe("MetaData", () => {
    let testInfo;
    let main;
    let baseUrl;

    const addClaim = async (data) =>
        rp.post({
            url: `${baseUrl}/claim`,
            body: data,
            json: true
        });

    const listClaims = async () =>
        rp({
            url: `${baseUrl}/claim`,
            json: true
        });

    before(async () => {
        testInfo = {
            name: "metadata-claims",
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

    const claim1 = {
        text: "Claim 1",
        creatorRef: {
            _ref: true,
            id: "type1",
            type: "service1.type"
        }
    };

    const claim2 = {
        text: "Claim 2",
        creatorRef: {
            _ref: true,
            id: "type1",
            type: "service1.type"
        },
        targetRef: {
            _ref: true,
            id: "type2",
            type: "service2.type"
        }
    };

    describe("type claim", () => {
        it("should initially list no claims", async () => {
            const data = await listClaims();
            assert.equal(data.length, 0);
        });

        let claim1Id;
        it("should add claim", async () => {
            const data = await addClaim(claim1);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data.text, claim1.text);
            assert.deepEqual(data.data.creatorRef, claim1.creatorRef);
            assert.strictEqual(data.data.targetRef, false);
            claim1Id = data.data._id;
        });

        it("should list claim", async () => {
            const data = await listClaims();
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, claim1Id);
            assert.strictEqual(data[0].text, claim1.text);
        });

        let claim2Id;
        it("should add claim with targetRef", async () => {
            const data = await addClaim(claim2);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data.text, claim2.text);
            assert.deepEqual(data.data.creatorRef, claim2.creatorRef);
            assert.deepEqual(data.data.targetRef, claim2.targetRef);
            claim2Id = data.data._id;
        });

        it("should list claims", async () => {
            const data = await listClaims();
            assert.equal(data.length, 2);

            assert(data.find((item) => item._id === claim1Id));
            assert(data.find((item) => item._id === claim2Id));
        });

        it("should not add claim without text", async () => {
            try {
                await addClaim({
                    creatorRef: { _ref: true, id: "id1", type: "service.type" }
                });
                assert(false, "Unexpected claim add");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.match(error.message, /text must be of type string/);
            }
        });
    });
});
