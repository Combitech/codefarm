"use strict";

/* global describe it */

const { assert } = require("chai");
const { ObjSerialize } = require("../index");

describe("ObjSerialize", () => {
    describe("flatten", () => {
        it("should convert flat object to environment variable object", () => {
            const opts = {
                keyFormatter: ObjSerialize.keyFormatters.none
            };
            const obj = {
                "key1": "value1",
                "key2": 1,
                "key3": true,
                "key4": false
            };
            const env = ObjSerialize.flatten(obj, opts);
            assert.deepEqual(env, {
                "key1": "value1",
                "key2": 1,
                "key3": true,
                "key4": false
            });
        });

        it("should convert flat object with arrays to environment variable object", () => {
            const opts = {
                keyFormatter: ObjSerialize.keyFormatters.none,
                annotateArrays: true
            };
            const obj = {
                "key1": "value1",
                "key2": [ "v1", "v2" ],
                "length": 1
            };
            const env = ObjSerialize.flatten(obj, opts);
            assert.deepEqual(env, {
                "key1": "value1",
                "key2_0": "v1",
                "key2_1": "v2",
                "key2_length": 2,
                "length": 1
            });
        });

        it("should convert non-flat object to environment variable object", () => {
            const opts = {
                prefix: "CF",
                keyFormatter: ObjSerialize.keyFormatters.addPrefixConvUpperCase
            };
            const obj = {
                "key1": "value1",
                "key2": "value2",
                "key3": {
                    "keyA": "valueA3",
                    "keyB": "valueB3"
                }
            };
            const env = ObjSerialize.flatten(obj, opts);
            assert.deepEqual(env, {
                "CF_KEY1": "value1",
                "CF_KEY2": "value2",
                "CF_KEY3_KEYA": "valueA3",
                "CF_KEY3_KEYB": "valueB3"
            });
        });

        it("should convert complex non-flat object with arrays to environment variable object", () => {
            const opts = {
                prefix: "CF",
                keyFormatter: ObjSerialize.keyFormatters.addPrefixConvUpperCase,
                annotateArrays: true
            };
            const obj = {
                "key1": {
                    "a": [
                        "one",
                        { "a": "end", "b": "endb" }
                    ]
                },
                "key2": "value2",
                "key3": {
                    "keyA": "valueA3",
                    "keyB": "valueB3",
                    "keyC": 1
                }
            };
            const env = ObjSerialize.flatten(obj, opts);
            assert.deepEqual(env, {
                "CF_KEY1_A_0": "one",
                "CF_KEY1_A_1_A": "end",
                "CF_KEY1_A_1_B": "endb",
                "CF_KEY1_A_LENGTH": 2,
                "CF_KEY2": "value2",
                "CF_KEY3_KEYA": "valueA3",
                "CF_KEY3_KEYB": "valueB3",
                "CF_KEY3_KEYC": 1
            });
        });
    });
});
