"use strict";

const Team = require("../types/team");
const { Controller } = require("servicecom");

class Teams extends Controller {
    constructor() {
        super(Team);
    }
}

module.exports = Teams;
