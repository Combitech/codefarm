"use strict";

/* global describe it */

const { assert } = require("chai");
const VersionSchemeFactory = require("../index");

describe("version_scheme", () => {
    describe("default", () => {
        it("should create default and return a valid intial version", () => {
            const gen = VersionSchemeFactory.create("default");
            const initialVer = gen.next("");
            assert.strictEqual(initialVer, "0.0.1");
            assert.isTrue(gen.isValid(initialVer));
        });

        it("should return next version incrementing patch", () => {
            const gen = VersionSchemeFactory.create("default");
            assert.strictEqual(gen.next("0.0.1"), "0.0.2");
            assert.strictEqual(gen.next("0.0.9"), "0.0.10");
            assert.strictEqual(gen.next("0.9.0"), "0.9.1");
            assert.strictEqual(gen.next("9.0.0"), "9.0.1");
            assert.strictEqual(gen.next("9.2.1"), "9.2.2");
        });

        it("should sort versions ascending", () => {
            const gen = VersionSchemeFactory.create("default");
            assert.deepEqual(
                gen.sort([ "2.0.1", "0.9.1", "3.0.0", "0.0.1" ]),
                [ "0.0.1", "0.9.1", "2.0.1", "3.0.0" ]);
        });

        it("should validate versions", () => {
            const gen = VersionSchemeFactory.create("default");

            // Test som valid versions.
            for (const v of [ "9.9.9", "9999.9.9", "0.9992.9" ]) {
                assert.isTrue(gen.isValid(v));
            }

            // Test som invalid versions.
            for (const v of [ "a9.9.9", "9999.a9.9", "0.99929", "", "123", ".0.1", "0.0." ]) {
                assert.isFalse(gen.isValid(v));
            }
        });
    });
});
