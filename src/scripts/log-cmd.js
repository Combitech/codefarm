"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { logrepo: configLogRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Log id",
    type: "array",
    default: []
})
.option("f", {
    alias: "file",
    describe: "Path to store downloaded logfile",
    type: "string",
    default: undefined
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${configLogRepo.web.port}`;

    if (argv.id.length === 1 && argv.file) {
        const id = argv.id[0];
        console.log(`Get log ${id} to path ${argv.file}`);
        const writeStream = fs.createWriteStream(argv.file);
        writeStream.on("finish", () => {
            console.log("Download done.");
        });
        const result = await rp.get({
            url: `${baseUrl}/log/${id}/download`,
        })
        .on("error", (err) => {
            console.log(err);
        })
        .pipe(writeStream);
    } else if (!argv.file) {
        console.log(`Get log ${JSON.stringify(argv.id)}`);
        if (argv.id.length === 0) {
            // Fix since empty arrays isn't encoded as empty arrays...
            argv.id.push("__THIS_IS_AN_EMPTY_ARRAY__");
        }
        const result = await rp.get({
            url: `${baseUrl}/log`,
            qs: { _id: { $in: argv.id } },
            json: true
        });
        console.log(result);
    }
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
