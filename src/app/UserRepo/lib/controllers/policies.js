"use strict";

const Policy = require("../types/policy");
const { Controller } = require("servicecom");

class Policies extends Controller {
    constructor() {
        super(Policy);
    }
}

module.exports = Policies;
