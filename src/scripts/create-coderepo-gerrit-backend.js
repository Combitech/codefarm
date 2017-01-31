"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { coderepo: configCodeRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "Gerrit"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "gerrit"
})
.option("uri", {
    describe: "URI to use when connection to gerrit",
    type: "string",
    requiresArg: true,
    default: "ssh://admin@localhost:29418"
})
.option("privateKeyPath", {
    describe: "Private key matching the public key uploaded for the user specified with the --uri option",
    type: "string",
    requiresArg: true,
    default: path.join("/home", process.env.USER, ".ssh", "id_rsa")
})
.argv;

const run = async () => {
    console.log(`Adding backend ${argv.id}`);
    let result = await rp.post({
        url: `http://localhost:${configCodeRepo.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type,
            uri: argv.uri,
            privateKeyPath: argv.privateKeyPath
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
