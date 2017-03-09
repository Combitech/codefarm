"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { coderepo: config } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Revision id",
    type: "string",
    required: true,
    requiresArg: true
})
.option("m", {
    alias: "merge",
    describe: "Merge revision",
    type: "boolean",
    default: false
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${config.web.port}`;
    console.log("Revision command");
    let getRevision = true;

    if (argv.merge) {
        getRevision = false;
        const result = await rp.post({
            url: `${baseUrl}/revision/${argv.id}/merge`,
            json: true
        });

        console.dir(result, { colors: true, depth: null });
    }

    if (getRevision) {
        console.log(`Get revision ${argv.id}`);
        const result = await rp.get({
            url: `${baseUrl}/revision/${argv.id}`,
            json: true
        });

        console.dir(result, { colors: true, depth: null });
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
