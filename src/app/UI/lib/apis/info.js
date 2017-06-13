"use strict";

const api = require("api.io");
const singleton = require("singleton");
const exec = require("child_process").exec;
const { ServiceMgr } = require("service");

const GIT_HASH_ENV_VARIABLE_NAME = "CF_GIT_HASH";

const info = {
    name: "noname",
    version: "noversion",
    config: "noconfig"
};

const infoApiExports = api.register("info", {
    get: api.export(async () => info)
});

class InfoApi {
    constructor() {
        this.exports = infoApiExports;
    }

    getHash() {
        return new Promise((resolve, reject) => {
            exec("git rev-parse HEAD", (error, stdout) => {
                if (error) {
                    return reject(error);
                }

                resolve(stdout.replace(/(\r\n|\n|\r)/gm, ""));
            });
        });
    }

    async start(config, name, version) {
        info.name = name;
        info.version = version;
        info.config = config._id;

        if (info.version === "0.0.0") {
            let gitHash = process.env[GIT_HASH_ENV_VARIABLE_NAME];

            if (!gitHash) {
                try {
                    gitHash = await this.getHash();
                } catch (error) {
                    console.error("Failed to get git hash", error);
                }
            }

            if (gitHash) {
                info.version = gitHash;
            }
        }

        ServiceMgr.instance.log("info", `Info API started, info=${JSON.stringify(info)}`);
    }

    async dispose() {
    }
}

module.exports = singleton(InfoApi);
