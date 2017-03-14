"use strict";

/* global describe it */

const { assert } = require("chai");
const { validatePrivilegeFormat } = require("../index");

const TEST_TYPE = {
    FORMAT_VALID: "accept access format",
    FORMAT_INVALID: "deny access format"
};

describe("validatePrivilegeFormat", () => {
    const tests = [
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "access1:service1.type1"
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "access1",
            errorRegex: /expecting only one ":" to delimit accesses and type/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: ":t",
            errorRegex: /expecting accesses before ":"/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:",
            errorRegex: /expecting type after ":"/
        },
        // Accesses pattern
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "access1,access2:service1.type1"
        },
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "access1,access2,access3:service1.type1"
        },
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "*:service1.type1"
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a b:t",
            errorRegex: /accesses part only allows/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a2,a b:t",
            errorRegex: /accesses part only allows/
        },
        // Type pattern
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "a:*"
        },
        {
            testType: TEST_TYPE.FORMAT_VALID,
            access: "a:service1.*"
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:*.type1", // TODO: Support this format
            errorRegex: /type part only allows/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:service1.type1.",
            errorRegex: /type part only allows/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:*.service1.type1",
            errorRegex: /type part only allows/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:ser vice1.type1",
            errorRegex: /type part only allows/
        },
        {
            testType: TEST_TYPE.FORMAT_INVALID,
            access: "a:service1.ty pe1",
            errorRegex: /type part only allows/
        }
    ];
    for (const test of tests) {
        it(`should ${test.testType} ${test.access}`, () => {
            const testFn = validatePrivilegeFormat.bind(null, test.access);
            if (test.testType === TEST_TYPE.FORMAT_INVALID) {
                const errorRegex = test.errorRegex || /Invalid privilege format/;
                assert.throws(testFn, errorRegex);
            } else if (test.testType === TEST_TYPE.FORMAT_VALID) {
                assert.doesNotThrow(testFn);
            }
        });
    }
});
