"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { coderepo: configCodeRepo } = require("../app/Mgmt/cfg/config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "CRS Git"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "git"
})
.option("path", {
    describe: "Path to store GIT repositories",
    type: "string",
    requiresArg: true,
    default: path.join("/tmp", "repos")
})
.option("port", {
    describe: "Port listen for GIT clients on",
    type: "number",
    requiresArg: true,
    default: 44675
})
.argv;

const run = async () => {
    console.log(`Adding backend ${argv.id}`);
    let result = await rp.post({
        url: `http://localhost:${configCodeRepo.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type,
            path: argv.path,
            port: argv.port
        },
        json: true
    });

    console.dir(result, { colors: true, depth: null });
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
