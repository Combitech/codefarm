"use strict";

const Flow = require("../types/flow");
const { Controller } = require("servicecom");

class Flows extends Controller {
    constructor() {
        super(Flow);
    }
}

module.exports = Flows;
