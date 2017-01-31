"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { userrepo: configUserRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
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
.option("b", {
    alias: "backend",
    describe: "Backend name",
    type: "string",
    requiresArg: true,
    default: "Dummy"
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
.argv;

const run = async () => {
    console.log(`User ${argv.id}`);
    let result;
    if (!argv.no_create) {
        console.log(`Adding user ${argv.id}`);
        result = await rp.post({
            url: `http://localhost:${configUserRepo.web.port}/user`,
            body: {
                _id: argv.id,
                name: argv.name,
                teams: argv.teams,
                backend: argv.backend
            },
            json: true
        });
        console.dir(result, { colors: true, depth: null });
    }

    if (!argv.no_key) {
        console.log(`Adding public key to user ${argv.id}`);
        result = await rp.post({
            url: `http://localhost:${configUserRepo.web.port}/user/${argv.id}/addkey`,
            headers: {
                "Content-Type": "text/plain"
            },
            body: (await fs.readFileAsync(argv.key)).toString().replace(/\n/g, "")
        });

        console.dir(JSON.parse(result), { colors: true, depth: null });
    }

    if (argv.avatar) {
        console.log(`Adding avatar to user ${argv.id}`);
        // const fileType = "png";
        result = await rp.post({
            url: `http://localhost:${configUserRepo.web.port}/user/${argv.id}/setavatar`,
            /* headers: {
                "Content-Type": `image/${fileType}`
            }, */
            formData: {
                file: fs.createReadStream(argv.avatar)
            }
        });

        console.dir(JSON.parse(result), { colors: true, depth: null });
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
