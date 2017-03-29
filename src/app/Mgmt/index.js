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
.option("p", {
    alias: "port",
    describe: "Port for HTTP REST interface",
    type: "int",
    default: 19595
})
.option("msgbus", {
    describe: "RabbitMQ message bus URI",
    type: "string",
    default: "amqp://localhost:5672"
})
.option("mongo", {
    describe: "Mongo DB URI",
    type: "string",
    default: "mongodb://localhost:27017"
})
.option("jwtprivate", {
    describe: "Path to private key used for JWT encryption",
    type: "string",
    default: path.join(process.env.HOME, ".ssh", "id_rsa")
})
.option("jwtpublic", {
    describe: "Path to private key used for JWT encryption",
    type: "string",
    default: path.join(process.env.HOME, ".ssh", "id_rsa.pem.pub")
})
.options(getServiceOpts({ queueName: name }))
.argv;

setupProcessHooks();

const main = new Main(name, version);
argv.autoUseMgmt = false;
ServiceMgr.instance.create(main, argv).catch(crashHandler);
