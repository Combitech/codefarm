"use strict";

const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { exec: configExec } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Backend id",
    type: "string",
    requiresArg: true,
    default: "Direct"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "direct"
})
.option("u", {
    alias: "user",
    describe: "User for authentification",
    type: "string",
    requiresArg: true,
    default: "admin"
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
    const result = await rp.post({
        url: `http://localhost:${configExec.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type,
            authUser: argv.user,
            privateKeyPath: argv.privateKeyPath
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
