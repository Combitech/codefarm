"use strict";

const { Controller, notification } = require("typelib");
const Specification = require("../types/specification");

class Specifications extends Controller {
    constructor() {
        super(Specification);

        this._addAction("request", this._request);
    }

    async _request(ctx, id) {
        const specification = await this._getTypeInstance(ctx, id);

        await notification.emit(`${specification.constructor.typeName}.request`, specification);

        ctx.type = "json";
        ctx.body = JSON.stringify({ result: "success", action: "request" }, null, 2);
    }
}

module.exports = Specifications;
