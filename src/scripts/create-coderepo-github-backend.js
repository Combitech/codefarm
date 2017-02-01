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
    default: "Github"
})
.option("t", {
    alias: "type",
    describe: "Backend type",
    type: "string",
    requiresArg: true,
    default: "github"
})
.option("username", {
    describe: "GitHub username to authenticate as",
    type: "string",
    requiresArg: true
})
.option("token", {
    describe: "Authentication token to use",
    type: "string",
    requiresArg: true
})
.option("webhookURL", {
    describe: "Webhook callback URL",
    type: "string",
    requiresArg: true,
    default: "https://secor.runge.se"
})
.option("port", {
    describe: "Local web server port",
    type: "number",
    requiresArg: true,
    default: 3000
})
.argv;

const run = async () => {
    console.log(`Adding backend ${argv.id}`);
    const result = await rp.post({
        url: `http://localhost:${configCodeRepo.web.port}/backend`,
        body: {
            _id: argv.id,
            backendType: argv.type,
            username: argv.username,
            authToken: argv.token,
            webhookURL: argv.webhookURL,
            port: argv.port
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
