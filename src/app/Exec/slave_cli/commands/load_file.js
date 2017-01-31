"use strict";

const log = require("../log");
const fs = require("fs-extra-promise");

let cmdInfo;

module.exports = {
    init: (commander) => {
        commander
            .command("load_file <path>")
            .description("Read JSON file")
            .action((path) => {
                cmdInfo = {
                    path: path
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com, args) => {
        if (!args) {
            args = cmdInfo;
        }
        if (args) {
            log.verbose(`Load file ${args.path}`);
            cmdInfo = null;

            return {
                type: "response",
                data: JSON.parse(await fs.readFileAsync(args.path))
            };
        }
    }
};
