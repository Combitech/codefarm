"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const yargs = require("yargs");
const rp = require("request-promise");

const argv = yargs
.usage("Usage: $0 -c [config]")
.example("$0 -c ./cfg/config.json", "Specify configuration file to use")
.help("help")
.strict()
.option("c", {
    alias: "config",
    describe: "Configuration file",
    type: "string",
    default: path.join(__dirname, "config.json")
})
.option("s", {
    alias: "service",
    describe: "Target service (specify \"all\" to target all services)",
    type: "string",
    default: "all"
})
.option("mgmtCfgUri", {
    describe: "Mgmt config HTTP REST interface",
    type: "string",
    default: "http://localhost:19595/config"
})
.option("noActivate", {
    describe: "Do not activate created configs by default",
    type: "boolean",
    default: false
})
.argv;

const createConfig = async (serviceName, serviceCfg) => {
    serviceCfg.name = serviceName;
    console.log(`Creating config for ${serviceName}`);
    let result = await rp.post({
        url: argv.mgmtCfgUri,
        body: serviceCfg,
        json: true
    });
    console.dir(result, { colors: true, depth: null });

    if (!argv.noActivate) {
        // Set uploaded config active
        const id = result.data._id;
        console.log(`Tag config ${serviceName} active`);
        result = await rp.post({
            url: `${argv.mgmtCfgUri}/${id}/tag`,
            body: {
                tag: "active"
            },
            json: true
        });
        console.dir(result, { colors: true, depth: null });
    }
};

const run = async () => {
    console.log(`Create config from file ${argv.config}`);
    const cfg = JSON.parse(await fs.readFileAsync(argv.config));

    if (argv.service === "all") {
        for (const cfgKey of Object.keys(cfg)) {
            await createConfig(cfgKey, cfg[cfgKey]);
        }
    } else if (argv.service in cfg) {
        await createConfig(argv.service, cfg[argv.service]);
    } else {
        console.error(`Cannot find service ${argv.service} in config`);
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
