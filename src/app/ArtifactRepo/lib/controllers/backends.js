"use strict";

const Backend = require("../types/backend");
const { Controller } = require("servicecom");

class Backends extends Controller {
    constructor() {
        super(Backend, [ "read", "create", "remove", "tag", "ref" ]);
    }
}

module.exports = Backends;
