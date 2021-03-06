"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
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
    describe: "User id",
    type: "string",
    requiresArg: true,
    default: process.env.USER
})
.option("n", {
    alias: "name",
    describe: "User name",
    type: "string",
    requiresArg: true,
    default: process.env.USER
})
.option("password", {
    describe: "Password",
    type: "string"
})
.option("b", {
    alias: "backend",
    describe: "Backend name",
    type: "string",
    requiresArg: true,
    default: "Dummy"
})
.option("email", {
    describe: "User emails",
    type: "array",
    default: []
})
.option("k", {
    alias: "key",
    describe: "Public key",
    type: "string",
    requiresArg: true,
    default: path.join(process.env.HOME, ".ssh", "id_rsa.pub")
})
.option("t", {
    alias: "teams",
    describe: "Teams",
    type: "array",
    default: []
})
.option("policy", {
    describe: "Policy",
    type: "array",
    default: []
})
.option("no_key", {
    describe: "Do not upload key",
    type: "bool",
    default: false
})
.option("no_create", {
    describe: "Do not create user",
    type: "bool",
    default: false
})
.option("avatar", {
    describe: "Avatar image file to upload",
    type: "string",
    requiresArg: true
})
.option("githubalias", {
    describe: "Username on github",
    type: "string",
    requiresArg: true
})
.argv;

const run = async () => {
    console.log(`User ${argv.id}`);
    let result;

    if (!argv.no_create) {
        console.log(`Adding user ${argv.id}`);
        result = await rp.post({
            url: `http://${argv.service_addr}:${configUserRepo.web.port}/user`,
            body: {
                _id: argv.id,
                name: argv.name,
                aliases: { github: argv.githubalias },
                teams: argv.teams,
                email: argv.email,
                backend: argv.backend,
                password: argv.password,
                policies: argv.policy
            },
            json: true
        });
        console.dir(result, { colors: true, depth: null });
        if (result.result !== "success") {
            console.error("Failed to create user");
            process.exit(1);
        }
    }

    if (!argv.no_key) {
        console.log(`Adding public key to user ${argv.id}`);
        result = await rp.post({
            url: `http://${argv.service_addr}:${configUserRepo.web.port}/user/${argv.id}/addkey`,
            headers: {
                "Content-Type": "text/plain"
            },
            body: (await fs.readFileAsync(argv.key)).toString().replace(/\n/g, "")
        });

        console.dir(JSON.parse(result), { colors: true, depth: null });
    }

    if (argv.avatar) {
        console.log(`Creating avatar for user ${argv.id}`);
        try {
            result = await rp.post({
                url: `http://${argv.service_addr}:${configUserRepo.web.port}/useravatar`,
                body: {
                    _id: argv.id
                },
                json: true
            });
        } catch (error) {
            if (error.error.error !== `Object with id ${argv.id} already exist`) {
                console.error("Error occured when creating avatar", error);
            }
        }
        console.log(`Uploading avatar for user ${argv.id}`);
        result = await rp.post({
            url: `http://${argv.service_addr}:${configUserRepo.web.port}/useravatar/${argv.id}/upload`,
            formData: {
                file: fs.createReadStream(argv.avatar)
            }
        });
        if (!result) {
            console.error("Error uploading avatar");
        }
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
