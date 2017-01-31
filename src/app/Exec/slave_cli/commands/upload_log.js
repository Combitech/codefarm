"use strict";

const log = require("../log");

let cmdInfo;

const addToList = (val, memo) => {
    memo.push(val);

    return memo;
};

module.exports = {
    init: (commander) => {
        commander
            .command("upload_log <path> <name>")
            .description("Upload log file (stable)")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .action((path, name, opts) => {
                cmdInfo = {
                    path: path,
                    name: name,
                    opts: opts
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com) => {
        if (cmdInfo) {
            const cmdJson = {
                type: "cmd",
                action: "file_upload",
                data: {
                    kind: "log",
                    data: {
                        path: cmdInfo.path,
                        name: cmdInfo.name,
                        tags: cmdInfo.opts.tag
                    }
                }
            };
            log.verbose(`Upload log ${cmdInfo.path} as name ${cmdInfo.name}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
