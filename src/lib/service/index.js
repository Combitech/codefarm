"use strict";

const Service = require("./lib/service");
const ServiceMgr = require("./lib/manager");
const getCmdLineOpts = require("./lib/cmdline_opts");
const { setupProcessHooks, crashHandler } = require("./lib/setup_process_hooks");
const STATE = require("./lib/states");
const { ServiceError } = require("./lib/errors");

module.exports = {
    ServiceMgr,
    Service,
    getCmdLineOpts,
    STATE,
    ServiceError,
    setupProcessHooks,
    crashHandler
};
