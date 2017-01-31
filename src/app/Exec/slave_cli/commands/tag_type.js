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
            .command("tag_type <typeName> <id>")
            .description("Tag type")
            .option("-t, --tag <tag>", "Tag to add", addToList, [])
            .action((typeName, id, opts) => {
                cmdInfo = {
                    typeName: typeName,
                    id: id,
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
                action: "type_action",
                data: {
                    typeName: args.typeName,
                    id: args.id,
                    action: "tag",
                    data: {}
                }
            };
            if (args.opts && args.opts.tag) {
                cmdJson.data.data.tag = args.opts.tag;
            }
            log.verbose(`Tag type ${args.typeName} with data ${JSON.stringify(args.data)}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
