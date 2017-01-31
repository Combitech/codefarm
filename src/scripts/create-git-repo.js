"use strict";

const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const rp = require("request-promise");
const { coderepo: configCodeRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("n", {
    alias: "name",
    describe: "Code repository name",
    type: "string",
    requiresArg: true,
    default: "MyGitRepository"
})
.option("b", {
    alias: "backend",
    describe: "Repository backend type",
    type: "string",
    requiresArg: true,
    default: "CRS Git"
})
.argv;

const run = async () => {
    console.log(`Adding a new repository`);
    const data = {
        _id: argv.name,
        backend: argv.backend
    };
    const result = await rp.post({
        url: `http://localhost:${configCodeRepo.web.port}/repository`,
        body: data,
        json: true
    });

    console.dir(result, { colors: true, depth: null });
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
