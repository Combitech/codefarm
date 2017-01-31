"use strict";

/* global describe it */

const { assert } = require("chai");
const { assertType } = require("../index");

const TEST_TYPE = {
    THROWS: "throw error",
    DOES_NOT_THROW: "not throw an error"
};

describe("assertType", () => {
    const tests = [
        {
            type: TEST_TYPE.THROWS,
            variable: undefined, // eslint-disable-line no-undefined
            expectedType: "string",
            errorRegex: /must be of type string/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: 10,
            expectedType: "string",
            errorRegex: /must be of type string/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: [ 1, 2, 3 ],
            expectedType: "string",
            errorRegex: /must be of type string/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: undefined, // eslint-disable-line no-undefined
            expectedType: "number",
            errorRegex: /must be of type number/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: "some_string",
            expectedType: "number",
            errorRegex: /must be of type number/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: [ 1, 2, 3 ],
            expectedType: "number",
            errorRegex: /must be of type number/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: undefined, // eslint-disable-line no-undefined
            expectedType: "array",
            errorRegex: /must be an array/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: 10,
            expectedType: "array",
            errorRegex: /must be an array/
        },
        {
            type: TEST_TYPE.THROWS,
            variable: "some_string",
            expectedType: "array",
            errorRegex: /must be an array/
        },
        {
            type: TEST_TYPE.DOES_NOT_THROW,
            variable: "some_string",
            expectedType: "string",
            errorRegex: /must be of type string/
        },
        {
            type: TEST_TYPE.DOES_NOT_THROW,
            variable: 100,
            expectedType: "number",
            errorRegex: /must be of type number/
        },
        {
            type: TEST_TYPE.DOES_NOT_THROW,
            variable: [],
            expectedType: "array",
            errorRegex: /must be an array/
        },
        {
            type: TEST_TYPE.DOES_NOT_THROW,
            variable: [ 1, 2, 3 ],
            expectedType: "array",
            errorRegex: /must be an array/
        }
    ];
    for (const test of tests) {
        it(`should ${test.type} for variable value ${test.variable} with expected type ${test.expectedType}`, () => {
            if (test.type === TEST_TYPE.THROWS) {
                assert.throws(
                    assertType.bind(null, test.variable, "variableName", test.expectedType),
                    test.errorRegex
                );
            } else if (test.type === TEST_TYPE.DOES_NOT_THROW) {
                assert.doesNotThrow(assertType.bind(null, test.variable, "variableName", test.expectedType));
            }
        });
    }
});
