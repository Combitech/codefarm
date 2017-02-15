"use strict";

const Repository = require("../types/repository");
const { Controller } = require("servicecom");

class Repositories extends Controller {
    constructor() {
        super(Repository);
    }
}

module.exports = Repositories;
