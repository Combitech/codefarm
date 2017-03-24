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

    const addComment = async (data) =>
        rp.post({
            url: `${baseUrl}/comment`,
            body: data,
            json: true
        });

    const listComments = async () =>
        rp({
            url: `${baseUrl}/comment`,
            json: true
        });

    before(async () => {
        testInfo = {
            name: "metadata",
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

    const comment1 = {
        text: "Comment 1",
        sourceRef: {
            _ref: true,
            id: "type1",
            type: "service1.type"
        }
    };

    const comment2 = {
        text: "Comment 2",
        sourceRef: {
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

    describe("type comment", () => {
        it("should initially list no comments", async () => {
            const data = await listComments();
            assert.equal(data.length, 0);
        });

        let comment1Id;
        it("should add comment", async () => {
            const data = await addComment(comment1);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data.text, comment1.text);
            assert.deepEqual(data.data.sourceRef, comment1.sourceRef);
            assert.strictEqual(data.data.targetRef, false);
            comment1Id = data.data._id;
        });

        it("should list comment", async () => {
            const data = await listComments();
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, comment1Id);
            assert.strictEqual(data[0].text, comment1.text);
        });

        let comment2Id;
        it("should add comment with targetRef", async () => {
            const data = await addComment(comment2);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data.text, comment2.text);
            assert.deepEqual(data.data.sourceRef, comment2.sourceRef);
            assert.deepEqual(data.data.targetRef, comment2.targetRef);
            comment2Id = data.data._id;
        });

        it("should list comments", async () => {
            const data = await listComments();
            assert.equal(data.length, 2);

            assert(data.find((item) => item._id === comment1Id));
            assert(data.find((item) => item._id === comment2Id));
        });

        it("should not add comment without text", async () => {
            try {
                await addComment({
                    sourceRef: { _ref: true, id: "id1", type: "service.type" }
                });
                assert(false, "Unexpected comment add");
            } catch (error) {
                assert.strictEqual(error.statusCode, 400);
                assert.match(error.message, /text must be of type string/);
            }
        });
    });
});
