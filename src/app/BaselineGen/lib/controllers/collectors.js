"use strict";

const { Controller } = require("servicecom");
const Collector = require("../types/collector");

class Collectors extends Controller {
    constructor() {
        super(Collector, [ "read" ]);
    }
}

module.exports = Collectors;
