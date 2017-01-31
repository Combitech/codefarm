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
            .command("upload_artifact <id> <path>")
            .description("Upload artifact file to existing artifact (stable)")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .action((id, path, opts) => {
                cmdInfo = {
                    id: id,
                    path: path,
                    opts: opts
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
                action: "file_upload",
                data: {
                    kind: "artifact",
                    data: {
                        artifactId: args.id,
                        path: args.path,
                        tags: args.opts.tag
                    }
                }
            };
            log.verbose(`Upload artifact ${args.path} to artifact id ${args.id}`);
            cmdInfo = null;

            return await com.request(cmdJson);
        }
    }
};
