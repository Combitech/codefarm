"use strict";

/* global describe it */

const { assert } = require("chai");
const Auth = require("../index");

describe("token", () => {
    it("should create and validate", async () => {
        const tokenData = {
            a: 1,
            b: 2
        };
        const tokenType = "testType";
        // Use alg HS256 with secret instead of private public key-pair which needs to be generated...
        const testSecret = "top-secret-string-used-in-test";
        Auth.instance.setKeys({
            private: testSecret,
            public: testSecret
        });
        const createRes = await Auth.instance.createToken(tokenData, {
            // Use secret-based alg during test to get rid of key-generation...
            algorithm: "HS256"
        }, tokenType);
        assert.property(createRes, "tokenData");
        assert.property(createRes, "token");
        assert.strictEqual(createRes.tokenData.a, tokenData.a);
        assert.strictEqual(createRes.tokenData.b, tokenData.b);
        assert.strictEqual(createRes.tokenData.type, tokenType);

        const verifyRes = await Auth.instance.verifyToken(createRes.token);
        const expectedVerifyRes = Object.assign({}, createRes.tokenData, {
            iat: verifyRes.iat,
            iss: verifyRes.iss
        });
        assert.deepEqual(verifyRes, expectedVerifyRes);
    });
});
