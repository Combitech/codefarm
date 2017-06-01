"use strict";

const { name, version } = require("./package.json");
const { join } = require("path");
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
    default: join(__dirname, "cfg", "config.json")
})
.option("backendSearchPath", {
    describe: "Path to search for external backends",
    type: "array",
    default: []
})
.options(getServiceOpts({ queueName: name }))
.argv;

setupProcessHooks();

const main = new Main(name, version);
ServiceMgr.instance.create(main, argv).catch(crashHandler);
