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
.option("service_addr", {
    describe: "Management REST service address",
    type: "string",
    requiresArg: true,
    default: "localhost"
})
.option("p", {
    alias: "port",
    describe: "Management REST service port",
    type: "number",
    requiresArg: true,
    default: 19595
})
.option("c", {
    alias: "config",
    describe: "Configuration file",
    type: "string",
    default: path.join(__dirname, "config.json")
})
.option("s", {
    alias: "services",
    describe: "Target service(s) (specify \"all\" to target all services)",
    type: "array",
    default: [ "all" ]
})
.option("noActivate", {
    describe: "Do not activate created configs by default",
    type: "boolean",
    default: false
})
.option("authname", {
    describe: "UI Basic Auth username",
    type: "string",
    default: null
})
.option("authpass", {
    describe: "UI Basic Auth password",
    type: "string",
    default: null
})
.option("loglevel", {
    describe: "Set new log level",
    type: "string"
})
.argv;

const mgmtCfgUri = `http://${argv.service_addr}:${argv.port}/config`;

const createConfig = async (serviceName, serviceCfg) => {
    serviceCfg.name = serviceName;
    console.log(`Creating config for ${serviceName}`);
    let result = await rp.post({
        url: mgmtCfgUri,
        body: serviceCfg,
        json: true
    });
    console.dir(result, { colors: true, depth: null });

    if (!argv.noActivate) {
        // Set uploaded config active
        const id = result.data._id;
        console.log(`Tag config ${serviceName} active`);
        result = await rp.post({
            url: `${mgmtCfgUri}/${id}/tag`,
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

    if (argv.authname && argv.authpass) {
        cfg.ui.web.auth = Object.assign({}, cfg.ui.web.auth, {
            name: `${argv.authname}`,
            pass: `${argv.authpass}`
        });
    }

    // Expand services
    if (argv.services.length === 1 && argv.services[0] === "all") {
        argv.services = Object.keys(cfg);
    }

    for (const service of argv.services) {
        if (!(service in cfg)) {
            console.error(`Cannot find service ${service} in config`);

            return;
        }
    }

    for (const service of argv.services) {
        if (argv.loglevel) {
            cfg[service] = Object.assign({}, cfg[service], {
                level: argv.loglevel });
        }

        await createConfig(service, cfg[service]);
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
