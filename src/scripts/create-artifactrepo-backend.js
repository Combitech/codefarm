"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { artifactrepo: configArtifactRepo } = require("../app/Mgmt/cfg/config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "Filesystem"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "fs"
})
.option("p", {
    alias: "path",
    describe: "Path to store repositories",
    type: "string",
    requiresArg: true,
    default: path.join("/tmp", "artifact_repos")
})
.argv;

const run = async () => {
    console.log(`Adding backend ${argv.id}`);
    let result = await rp.post({
        url: `http://localhost:${configArtifactRepo.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type,
            path: argv.path
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
