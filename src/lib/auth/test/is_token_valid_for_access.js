"use strict";

/* global describe it */

const { assert } = require("chai");
const { isTokenValidForAccess } = require("../index");

const TEST_TYPE = {
    ACCESS_GRANTED: "grant access",
    ACCESS_DENIED: "deny access"
};

describe("isTokenValidForAccess", () => {
    const tests = [
        // Access wildcard
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [ "*:*" ] },
            type: "service1.type1",
            accessType: "read"
        },
        // Type wildcard
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [ "read:*" ] },
            type: "service1.type1",
            accessType: "read"
        },
        {
            testType: TEST_TYPE.ACCESS_DENIED,
            tokenData: { priv: [ "write:*" ] },
            type: "service1.type1",
            accessType: "read"
        },
        // Typename wildcard
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [ "read:service1.*" ] },
            type: "service1.type1",
            accessType: "read"
        },
        {
            testType: TEST_TYPE.ACCESS_DENIED,
            tokenData: { priv: [ "write:service1.*" ] },
            type: "service1.type1",
            accessType: "read"
        },
        // No wildcards
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [ "read:service1.type1" ] },
            type: "service1.type1",
            accessType: "read"
        },
        {
            testType: TEST_TYPE.ACCESS_DENIED,
            tokenData: { priv: [ "write:service1.type1" ] },
            type: "service1.type1",
            accessType: "read"
        },
        // Multiple accesses allowed on one type
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [ "read,write,update,create:service1.type1" ] },
            type: "service1.type1",
            accessType: "update"
        },
        {
            testType: TEST_TYPE.DENIED,
            tokenData: { priv: [ "read,write,update,create:service1.type1" ] },
            type: "service1.type1",
            accessType: "other"
        },
        // Multiple accesses allowed on different types
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [
                "read,write:service1.type1",
                "read:service1.type2",
                "create,read:service2.type1"
            ] },
            type: "service1.type2",
            accessType: "read"
        },
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [
                "read,write:service1.type1",
                "read:service1.type2",
                "create,read:service2.type1"
            ] },
            type: "service2.type1",
            accessType: "read"
        },
        {
            testType: TEST_TYPE.ACCESS_DENIED,
            tokenData: { priv: [
                "read,write:service1.type1",
                "read:service1.type2",
                "create,read:service2.type1"
            ] },
            type: "service2.type1",
            accessType: "write"
        },
        // Multiple accesses and wildcards
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [
                "read,write:service1.type1",
                "read:service1.type2",
                "create,read,*:service2.type1"
            ] },
            type: "service2.type1",
            accessType: "any"
        },
        {
            testType: TEST_TYPE.ACCESS_GRANTED,
            tokenData: { priv: [
                "read,write:service1.type1",
                "read:service1.type2",
                "create,read:service2.type1",
                "*:*"
            ] },
            type: "serviceX.typeX",
            accessType: "any"
        }
    ];
    for (const test of tests) {
        it(`should ${test.testType} ${test.accessType} on type ${test.type} using token ${JSON.stringify(test.tokenData)}`, () => {
            const testFn = isTokenValidForAccess.bind(null, test.tokenData, test.type, test.accessType);
            if (test.testType === TEST_TYPE.ACCESS_DENIED) {
                const errorRegex = new RegExp(`Access ${test.accessType}:${test.type} denied`);
                assert.throws(testFn, errorRegex);
            } else if (test.testType === TEST_TYPE.ACCESS_GRANTED) {
                assert.doesNotThrow(testFn);
            }
        });
    }
});
