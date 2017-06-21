"use strict";

const { name, version } = require("./package.json");
const path = require("path");
const yargs = require("yargs");
const Main = require("./lib/main");
const {
    ServiceMgr,
    getCmdLineOpts: getServiceOpts,
    setupProcessHooks,
    crashHandler
} = require("service");

const argv = yargs
.usage("Usage: $0 -c [config]")
.example("$0 -c ./cfg/config.json", "Specify configuration file to use")
.help("help")
.strict()
.option("level", {
    describe: "Log level",
    type: "string",
    default: "info"
})
.option("c", {
    alias: "config",
    describe: "Configuration file",
    type: "string",
    default: path.join(__dirname, "cfg", "config.json")
})
.option("plugin", {
    describe: "Path to plugin entry point",
    type: "array",
    // Need to resolve relative paths into absolute paths here
    // since they are given relative to this file and used elsewhere.
    coerce: (ps) => ps.map((p) => path.resolve(p)),
    default: []
})
.options(getServiceOpts({ queueName: name }))
.argv;

setupProcessHooks();

const main = new Main(name, version);
ServiceMgr.instance.create(main, argv).catch(crashHandler);
