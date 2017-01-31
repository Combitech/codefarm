"use strict";

const fs = require("fs");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { logrepo: configLogRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("n", {
    alias: "name",
    describe: "Log repository name",
    type: "string",
    requiresArg: true,
    default: "MyLogRepository"
})
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "Filesystem"
})
.argv;

const run = async () => {
    console.log(`Adding a new artifact repository`);
    const result = await rp.post({
        url: `http://localhost:${configLogRepo.web.port}/repository`,
        body: {
            _id: argv.name,
            backend: argv.id
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
