"use strict";

const SubJob = require("../types/sub_job");
const { Controller } = require("typelib");

class SubJobs extends Controller {
    constructor() {
        super(SubJob);
    }
}

module.exports = SubJobs;
