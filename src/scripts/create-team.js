"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const rp = require("request-promise");
const { userrepo: configUserRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Team id",
    type: "string",
    requiresArg: true,
    default: "team1"
})
.option("n", {
    alias: "name",
    describe: "Team name",
    type: "string",
    requiresArg: true,
    default: "Team 1"
})
.option("no_create", {
    describe: "Do not create team",
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
    console.log(`Adding team ${argv.id}`);
    let result;
    if (!argv.no_create) {
        result = await rp.post({
            url: `http://localhost:${configUserRepo.web.port}/team`,
            body: {
                _id: argv.id,
                name: argv.name
            },
            json: true
        });

        console.dir(result, { colors: true, depth: null });
    }

    if (argv.avatar) {
        console.log(`Creating avatar for team ${argv.id}`);
        try {
            result = await rp.post({
                url: `http://localhost:${configUserRepo.web.port}/teamavatar`,
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
        console.log(`Uploading avatar for team ${argv.id}`);
        result = await rp.post({
            url: `http://localhost:${configUserRepo.web.port}/teamavatar/${argv.id}/upload`,
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
