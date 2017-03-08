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
    describe: "User id",
    type: "string",
    requiresArg: true,
    default: process.env.USER
})
.option("password", {
    describe: "Password",
    type: "string"
})
.option("newPassword", {
    describe: "New password",
    type: "string"
})
.option("policy", {
    describe: "Policy",
    type: "array",
    default: []
})
.option("key", {
    describe: "Public key",
    type: "string"
})
.option("avatar", {
    describe: "Avatar image file to upload",
    type: "string"
})
.argv;

const run = async () => {
    console.log(`User ${argv.id}`);
    let result;

    if (argv.newPassword) {
        console.log(`Setting password for user ${argv.id}`);
        try {
            result = await rp.post({
                url: `http://localhost:${configUserRepo.web.port}/user/${argv.id}/setpassword`,
                body: {
                    password: argv.newPassword,
                    oldPassword: argv.password
                },
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to set password", error.message);
        }
    } else if (argv.password) {
        console.log(`Authenticating user ${argv.id}`);
        try {
            result = await rp.post({
                url: `http://localhost:${configUserRepo.web.port}/user/${argv.id}/auth`,
                body: {
                    password: argv.password
                },
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to authenticate user", error.message);
        }
    }

    if (argv.policy.length > 0) {
        console.log(`Setting policies ${argv.policy.join(", ")} to user ${argv.id}`);
        try {
            result = await rp.patch({
                url: `http://localhost:${configUserRepo.web.port}/user/${argv.id}`,
                body: {
                    policies: argv.policy
                },
                json: true
            });

            console.dir(result, { colors: true, depth: null });
        } catch (error) {
            console.error("Failed to set policy for user", error.message);
        }
    }

    if (argv.key) {
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
        console.log(`Creating avatar for user ${argv.id}`);
        try {
            result = await rp.post({
                url: `http://localhost:${configUserRepo.web.port}/useravatar`,
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
            url: `http://localhost:${configUserRepo.web.port}/useravatar/${argv.id}/upload`,
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
