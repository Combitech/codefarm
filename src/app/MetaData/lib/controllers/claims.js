"use strict";

const Claim = require("../types/claim");
const { Controller } = require("servicecom");

class Claims extends Controller {
    constructor() {
        super(Claim);
    }
}

module.exports = Claims;
