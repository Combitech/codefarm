"use strict";

const Step = require("../types/step");
const { Controller } = require("typelib");

class Steps extends Controller {
    constructor() {
        super(Step);
    }
}

module.exports = Steps;
