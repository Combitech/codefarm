"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const rp = require("request-promise");
const { stat: config } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.command("spec", "Spec command", {
    "i": {
        alias: "id",
        describe: "Specification id",
        type: "string"
    },
    "script": {
        describe: "Script file to upload",
        type: "string"
    }
})
.command("stat", "Stat command", {
    "i": {
        alias: "id",
        describe: "Statistic id",
        type: "string"
    },
    "info": {
        describe: "Query info for field",
        type: "array",
        requiresArg: true,
        default: []
    }
})
.argv;

const baseUrl = `http://localhost:${config.web.port}`;

const restUpdate = async (type, id, data = {}) => {
    const url = `${baseUrl}/${type}/${id}`;
    console.log(`Update ${url} with data ${JSON.stringify(data)}`);

    return rp.patch({ url, json: true, body: data });
};

const restGet = async (type, id = false, getter = false) => {
    let url = `${baseUrl}/${type}`;
    if (id) {
        url = url.concat(`/${id}`);
    }
    if (getter) {
        url = url.concat(`/${getter}`);
    }
    console.log(`Get ${url}`);

    return rp.get({ url: url, json: true });
};

const commands = {
    stat: async (argv) => {
        let getter = false;
        if (argv.id && argv.info.length > 0) {
            const queryStr = argv.info
                .map((field) => `field=${field}`)
                .join("&");
            getter = `info?${queryStr}`;
        }
        const result = await restGet("stat", argv.id, getter);
        console.dir(result, { colors: true, depth: null });
    },
    spec: async (argv) => {
        if (argv.script) {
            const scriptContent = await fs.readFileAsync(argv.script);
            const result = await restUpdate("spec", argv.id, {
                script: new Buffer(scriptContent).toString()
            });
            console.dir(result, { colors: true, depth: null });
        } else {
            const result = await restGet("spec", argv.id);
            console.dir(result, { colors: true, depth: null });
        }
    }
};

const run = async () => {
    const commandKey = argv._[0];
    if (typeof commandKey === "string") {
        console.log(`Command ${commandKey}`);
        await commands[commandKey](argv);
    } else {
        throw "Command not specified"; // eslint-disable-line no-throw-literal
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
