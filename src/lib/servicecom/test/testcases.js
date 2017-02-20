"use strict";

/* global describe it before */

const { assert } = require("chai");
const Database = require("./lib/database");

const testcases = (env) => {
    describe("Basic operations", () => {
        before(async () => {
            await Database.start();
        });

        it("should list zero objects", async () => {
            const list = await env.client.list("thing");

            assert.isArray(list);
            assert.equal(list.length, 0);
        });

        it("should create one object", async () => {
            const thing = await env.client.create("thing", {
                _id: "1",
                thingy: "Hello"
            });

            assert.equal(thing.type, "scom.thing");
            assert.equal(thing.thingy, "Hello");
        });

        it("should list one object", async () => {
            const list = await env.client.list("thing");

            assert.isArray(list);
            assert.equal(list.length, 1);
        });

        it("should update one object", async () => {
            const thing = await env.client.update("thing", "1", {
                thingy: "World"
            });

            assert.equal(thing.type, "scom.thing");
            assert.equal(thing.thingy, "World");
        });

        it("should delete one object", async () => {
            const thing = await env.client.remove("thing", "1");

            assert.equal(thing.type, "scom.thing");
            assert.equal(thing.thingy, "World");
        });

        it("should list zero objects", async () => {
            const list = await env.client.list("thing");

            assert.isArray(list);
            assert.equal(list.length, 0);
        });
    });

    describe("Action operations", () => {
        before(async () => {
            await Database.start();
        });

        it("should create an object and tag it", async () => {
            await env.client.create("thing", {
                _id: "1",
                thingy: "Hello"
            });

            const thing2 = await env.client.tag("thing", "1", {
                tag: [ "tag1", "tag2" ]
            });

            assert.equal(thing2.type, "scom.thing");
            assert.equal(thing2.thingy, "Hello");
            assert.deepEqual(thing2.tags, [ "tag1", "tag2" ]);
        });

        it("should get error with invalid action", async () => {
            try {
                await env.client.stuff("thing", "1", { 1: 0 });

                assert(false, "Should have thrown");
            } catch (error) {
                assert.equal(error.status, 400);
            }
        });
    });

    describe("Getter operations", () => {
        before(async () => {
            await Database.start();
        });

        it("should create an object and get something on it", async () => {
            await env.client.create("thing", {
                _id: "1",
                thingy: "Hello"
            });

            const value = await env.client.thingy("thing", "1");

            assert.equal(value, "Hello");
        });

        it("should get error with invalid getter", async () => {
            try {
                await env.client.stuff("thing", "1");

                assert(false, "Should have thrown");
            } catch (error) {
                assert.equal(error.status, 400);
            }
        });
    });
};

module.exports = testcases;
