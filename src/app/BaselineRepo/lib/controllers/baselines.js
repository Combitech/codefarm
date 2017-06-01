"use strict";

const Baseline = require("../types/baseline");
const { Controller } = require("servicecom");
const { synchronize } = require("misc");

class Baselines extends Controller {
    constructor() {
        super(Baseline, [ "read", "create", "update", "tag", "ref", "comment" ]);
    }
}

module.exports = Baselines;
