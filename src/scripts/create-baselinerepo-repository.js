"use strict";

const path = require("path");
const yargs = require("yargs");
const rp = require("request-promise");

const argv = yargs
.help("help")
.strict()
.option("c", {
    alias: "config",
    describe: "Configuration file",
    type: "string",
    requiresArg: true,
    default: path.join(__dirname, "config.json")
})
.option("service_addr", {
    describe: "Service address",
    type: "string",
    requiresArg: true,
    default: "localhost"
})
.option("i", {
    alias: "id",
    describe: "Repository id",
    type: "string",
    requiresArg: true,
    default: "default"
})
.option("b", {
    alias: "backend",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "dummy1"
})
.option("initial_baseline_tags", {
    describe: "Initial Baseline tags",
    type: "array",
    default: []
})
.argv;

const { baselinerepo: configBaselineRepo } = require(argv.config);
const baseUrl = `http://${argv.service_addr}:${configBaselineRepo.web.port}`;

const run = async () => {
    console.log(`Adding repository ${argv.id}`);
    const result = await rp.post({
        url: `${baseUrl}/repository`,
        body: {
            _id: argv.id,
            backend: argv.backend,
            initialBaselineTags: argv.initial_baseline_tags
        },
        json: true
    });
    console.dir(result, { colors: true, depth: null });
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
