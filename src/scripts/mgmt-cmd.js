"use strict";

const yargs = require("yargs");
const rp = require("request-promise");
// const { mgmt: configMgmt } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("p", {
    alias: "port",
    describe: "Mgmt REST port",
    type: "int",
    default: 19595
})
.option("encryptToken", {
    describe: "Encrypt token given as stringified JSON",
    type: "string"
})
.option("token", {
    describe: "Verify token",
    type: "string"
})
.option("getkey", {
    describe: "Get public key",
    type: "bool",
    default: false
})
.option("getconfig", {
    describe: "Get config for service",
    type: "string"
})
.argv;

const run = async () => {
    let result;

    if (argv.encryptToken) {
        console.log(`Encrypting token ${argv.encryptToken}`);
        try {
            result = await rp.post({
                url: `http://localhost:${argv.port}/service/X/createtoken`,
                body: JSON.parse(argv.encryptToken),
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to encrypt token", error.message);
        }
    }

    if (argv.token) {
        console.log(`Verifying token ${argv.token}`);
        try {
            result = await rp.post({
                url: `http://localhost:${argv.port}/service/X/verifytoken`,
                body: {
                    token: argv.token
                },
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to verify token", error.message);
        }
    }

    if (argv.getkey) {
        console.log("Get public key");
        try {
            result = await rp.get({
                url: `http://localhost:${argv.port}/service/X/getkey`,
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to get key", error.message);
        }
    }

    if (argv.getconfig) {
        console.log(`Get config for service ${argv.getconfig}`);
        try {
            result = await rp.get({
                url: `http://localhost:${argv.port}/config?name=${argv.getconfig}&tags=active`,
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to get config", error.message);
        }
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
