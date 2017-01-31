"use strict";

const { Controller } = require("typelib");
const Baseline = require("../types/baseline");

class Baselines extends Controller {
    constructor() {
        super(Baseline, [ "read" ]);
    }
}

module.exports = Baselines;
