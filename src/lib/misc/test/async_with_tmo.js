"use strict";

/* global describe it */

const { assert } = require("chai");
const { asyncWithTmo } = require("../index");
const { delay, mochaPatch } = require("testsupport");

mochaPatch();

describe("asyncWithTmo", () => {
    it("should resolve before timeout", async (ctx) => {
        ctx.timeout(5000);
        try {
            await asyncWithTmo(delay(10), 1000);
        } catch (error) {
            assert(false, "Unexpected timeout");
        }
    });

    it("should reject after timeout", async (ctx) => {
        ctx.timeout(5000);
        try {
            await asyncWithTmo(delay(1000), 10);
            assert(false, "Unexpected resolve");
        } catch (error) {
            assert.strictEqual(error.message, "Timeout expired");
        }
    });

    it("should reject with custom error after timeout", async (ctx) => {
        ctx.timeout(5000);
        const errorMsg = "My custom error message";
        try {
            await asyncWithTmo(delay(1000), 10, new Error(errorMsg));
            assert(false, "Unexpected resolve");
        } catch (error) {
            assert.strictEqual(error.message, errorMsg);
        }
    });
});
