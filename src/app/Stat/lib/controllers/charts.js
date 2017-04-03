"use strict";

const Chart = require("../types/chart");
const { Controller } = require("servicecom");

class Charts extends Controller {
    constructor() {
        super(Chart);
    }
}

module.exports = Charts;
