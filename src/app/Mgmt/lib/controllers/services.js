"use strict";

const Service = require("../types/service");
const { Controller } = require("servicecom");
const { Token } = require("auth");

const TOKEN_EXPIRES_IN = "5 days";

class Services extends Controller {
    constructor() {
        super(Service, [ "createtoken", "verifytoken", "getkey" ]);

        this._addAction("createtoken", this.createToken);
        this._addAction("verifytoken", this.verifyToken);
        this._addGetter("getkey", this.getKey);
    }

    async createToken(ctx, id, data) {
        this._isAllowed(ctx, "createtoken");
        if (typeof data !== "object" || data === null) {
            throw new Error("Request body must be an object");
        }

        return Token.instance.createToken(data, { expiresIn: TOKEN_EXPIRES_IN });
    }

    async verifyToken(ctx, id, data) {
        this._isAllowed(ctx, "verifytoken");
        if (typeof data !== "object" || data === null) {
            throw new Error("Request body must be an object");
        }

        if (typeof data.token !== "string") {
            throw new Error("token not a string");
        }

        return Token.instance.verifyToken(data.token, { expiresIn: TOKEN_EXPIRES_IN });
    }

    async getKey(ctx) {
        this._isAllowed(ctx, "getkey");

        return Token.instance.getPublicKey();
    }
}

module.exports = Services;
