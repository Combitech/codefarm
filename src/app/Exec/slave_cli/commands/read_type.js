"use strict";

const log = require("../log");

let cmdInfo;

module.exports = {
    init: (commander) => {
        commander
            .command("read_type <name> <id>")
            .description("Read type")
            .option("--getter <name>", "Optional getter name")
            .action((name, id, opts) => {
                cmdInfo = {
                    name: name,
                    id: id,
                    opts: opts
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com) => {
        if (cmdInfo) {
            const cmdJson = {
                type: "cmd",
                action: "type_read",
                data: {
                    typeName: cmdInfo.name,
                    id: cmdInfo.id,
                    getter: cmdInfo.opts.getter
                }
            };
            log.verbose(`Read type ${cmdInfo.name} with id ${cmdInfo.id}`);
            cmdInfo = null;

            return await com.request(cmdJson);
        }
    }
};
