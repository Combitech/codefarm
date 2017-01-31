"use strict";

/* global describe it */

const { assert } = require("chai");
const { TagCriteria } = require("../index");

describe("TagCriteria", () => {
    const tests = [
        {
            criteria: "abc AND dfg",
            tags: [ "abc" ],
            result: false
        },
        {
            criteria: "abc AND dfg",
            tags: [ "abc", "dfg" ],
            result: true
        },
        {
            criteria: "abc AND !dfg",
            tags: [ "abc", "dfg" ],
            result: false
        },
        {
            criteria: "abc AND !dfg",
            tags: [ "dfg" ],
            result: false
        },
        {
            criteria: "abc AND dfg",
            tags: [ ],
            result: false
        },
        {
            criteria: "(abc AND !dfg) OR klm",
            tags: [ "klm" ],
            result: true
        },
        {
            criteria: "(abc AND !dfg) OR klm",
            tags: [ "abc" ],
            result: true
        },
        {
            criteria: "(abc AND !dfg) OR klm",
            tags: [ "abc", "dfg" ],
            result: false
        },
        {
            criteria: "(abc AND !dfg) OR klm",
            tags: [ "klm", "dfg" ],
            result: true
        }
    ];

    for (const test of tests) {
        it(`should match (${test.criteria}) to ${JSON.stringify(test.tags)} with result ${test.result}`, () => {
            const criteria = new TagCriteria(test.criteria);

            assert.isTrue(criteria.isValid());
            assert.equal(criteria.match(test.tags), test.result);
        });
    }
});
