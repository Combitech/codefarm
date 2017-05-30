"use strict";

const yargs = require("yargs");
const rp = require("request-promise");
const { userrepo: configUserRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("service_addr", {
    describe: "Service address",
    type: "string",
    requiresArg: true,
    default: "localhost"
})
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "Dummy"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "dummy"
})
.argv;

const run = async () => {
    console.log(`Adding backend ${argv.id}`);
    const result = await rp.post({
        url: `http://${argv.service_addr}:${configUserRepo.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type
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
