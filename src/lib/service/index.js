"use strict";

const Service = require("./lib/service");
const ServiceMgr = require("./lib/manager");
const getCmdLineOpts = require("./lib/cmdline_opts");
const STATE = require("./lib/states");
const { ServiceError } = require("./lib/errors");

module.exports = {
    ServiceMgr,
    Service,
    getCmdLineOpts,
    STATE,
    ServiceError
};
