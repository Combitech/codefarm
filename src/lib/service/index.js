"use strict";

const Service = require("./lib/service");
const ServiceMgr = require("./lib/manager");
const getCmdLineOpts = require("./lib/cmdline_opts");
const STATE = require("./lib/states");
const { ServiceError } = require("./lib/errors");

module.exports = {
    serviceMgr: ServiceMgr.instance, // TODO: Remove usage of this in all apps
    ServiceMgr,
    Service,
    getCmdLineOpts,
    STATE,
    ServiceError
};
