"use strict";

const { Controller } = require("typelib");
const Collector = require("../types/collector");

class Collectors extends Controller {
    constructor() {
        super(Collector, [ "read" ]);
    }
}

module.exports = Collectors;
