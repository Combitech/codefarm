"use strict";

const Spec = require("../types/spec");
const { Controller } = require("servicecom");

class Specs extends Controller {
    constructor() {
        super(Spec);
    }
}

module.exports = Specs;
