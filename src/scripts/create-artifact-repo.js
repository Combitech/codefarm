"use strict";

const fs = require("fs");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { artifactrepo: configArtifactRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("n", {
    alias: "name",
    describe: "Artifact repository name",
    type: "string",
    requiresArg: true,
    default: "MyArtifactRepository"
})
.option("b", {
    alias: "backend",
    describe: "Artifact backend id",
    type: "string",
    requiresArg: true,
    default: "Filesystem"
})
.argv;

const run = async () => {
    console.log(`Adding a new artifact repository`);
    const result = await rp.post({
        url: `http://localhost:${configArtifactRepo.web.port}/repository`,
        body: {
            _id: argv.name,
            backend: argv.backend
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
