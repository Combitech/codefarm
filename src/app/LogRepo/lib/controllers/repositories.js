"use strict";

const Repository = require("../types/repository");
const { Controller } = require("typelib");

class Repositories extends Controller {
    constructor() {
        super(Repository);
    }
}

module.exports = Repositories;
