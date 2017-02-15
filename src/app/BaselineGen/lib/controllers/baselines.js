"use strict";

const { Controller } = require("servicecom");
const Baseline = require("../types/baseline");

class Baselines extends Controller {
    constructor() {
        super(Baseline, [ "read", "tag" ]);
    }
}

module.exports = Baselines;
