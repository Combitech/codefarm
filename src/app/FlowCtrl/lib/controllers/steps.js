"use strict";

const Step = require("../types/step");
const { Controller } = require("servicecom");

class Steps extends Controller {
    constructor() {
        super(Step);
    }
}

module.exports = Steps;
