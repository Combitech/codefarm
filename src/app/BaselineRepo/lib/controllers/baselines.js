"use strict";

const Baseline = require("../types/baseline");
const { Controller } = require("servicecom");

class Baselines extends Controller {
    constructor() {
        super(Baseline, [ "read", "create", "update", "tag", "ref", "comment" ]);
    }
}

module.exports = Baselines;
