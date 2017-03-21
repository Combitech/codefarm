"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const rp = require("request-promise");
const { logrepo: configLogRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("r", {
    alias: "repo",
    describe: "Log repository name",
    type: "string",
    requiresArg: true,
    default: "MyLogRepository"
})
.option("n", {
    alias: "name",
    describe: "Log name",
    type: "string",
    requiresArg: true,
    default: "Log1"
})
.option("f", {
    alias: "file",
    describe: "Logfile to upload",
    type: "string",
    requiresArg: true,
    default: null
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${configLogRepo.web.port}`;
    console.log("Adding a new log");
    const result = await rp.post({
        url: `${baseUrl}/log`,
        body: {
            name: argv.name,
            repository: argv.repo
        },
        json: true
    });

    console.dir(result, { colors: true, depth: null });

    if (result.result === "success" && argv.file) {
        const logId = result.data._id;
        console.log(`Uploading file ${argv.file} to log ${logId}`);
        const uploadResult = await rp.post({
            url: `${baseUrl}/log/${logId}/upload`,
            json: true,
            formData: {
                logfile: fs.createReadStream(argv.file)
            }
        });

        console.dir(uploadResult, { colors: true, depth: null });
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
