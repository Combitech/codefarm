"use strict";

const yargs = require("yargs");
const rp = require("request-promise");
const { exec: config } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Slave id",
    type: "string"
})
.option("setOnline", {
    describe: "Set slave online",
    type: "boolean"
})
.option("setOffline", {
    describe: "Set slave online",
    type: "boolean"
})
.option("verify", {
    describe: "Verify connection",
    type: "boolean"
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${config.web.port}`;
    console.log("Slave command");
    let getSlave = true;

    if (argv.setOnline || argv.setOffline) {
        getSlave = false;
        const result = await rp.post({
            url: `${baseUrl}/slave/${argv.id}/setonline`,
            json: true,
            body: {
                online: !!argv.setOnline,
                offline: !!argv.setOffline
            }
        });

        console.dir(result, { colors: true, depth: null });
    }

    if (argv.verify) {
        const result = await rp.post({
            url: `${baseUrl}/slave/${argv.id}/verify`,
            json: true,
            body: {}
        });

        console.dir(result, { colors: true, depth: null });
    }

    if (getSlave) {
        let url = `${baseUrl}/slave`;
        if (argv.id) {
            console.log(`Get slave ${argv.id}`);
            url = url.concat(`/${argv.id}`);
        } else {
            console.log("List slaves");
        }
        const result = await rp.get({ url: url, json: true });
        console.dir(result, { colors: true, depth: null });
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
