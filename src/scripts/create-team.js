"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { userrepo: configUserRepo } = require("../app/Mgmt/cfg/config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Team id",
    type: "string",
    requiresArg: true,
    default: "team1"
})
.option("n", {
    alias: "name",
    describe: "Team name",
    type: "string",
    requiresArg: true,
    default: "Team 1"
})
.argv;

const run = async () => {
    console.log(`Adding team ${argv.id}`);
    let result = await rp.post({
        url: `http://localhost:${configUserRepo.web.port}/team`,
        body: {
            _id: argv.id,
            name: argv.name
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
