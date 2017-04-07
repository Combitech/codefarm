"use strict";

const api = require("api.io");
const singleton = require("singleton");
const exec = require("child_process").exec;

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
            try {
                info.version = await this.getHash();
            } catch (error) {
                console.error("Failed to get git hash", error);
            }
        }
    }

    async dispose() {
    }
}

module.exports = singleton(InfoApi);
