"use strict";

const log = require("../log");

let cmdInfo;

module.exports = {
    init: (commander) => {
        commander
            .command("merge_revision <id>")
            .description("Merge a code revision (stable)")
            .action((id) => {
                cmdInfo = {
                    id: id
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com, args) => {
        if (!args) {
            args = cmdInfo;
        }
        if (args) {
            const cmdJson = {
                type: "cmd",
                action: "revision_merge",
                data: {
                    revisionId: args.id
                }
            };
            log.verbose(`Merge code revision ${args.id}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
