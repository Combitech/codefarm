"use strict";

const { Controller } = require("servicecom");
const { notification } = require("typelib");
const Specification = require("../types/specification");

class Specifications extends Controller {
    constructor() {
        super(Specification);

        this._addAction("request", this._request);
    }

    async _request(ctx, id) {
        const specification = await this._getTypeInstance(id);

        await notification.emit(`${specification.constructor.typeName}.request`, specification);

        return specification;
    }
}

module.exports = Specifications;
