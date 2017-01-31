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
            .command("ref_type <typeName> <id>")
            .description("Add reference to type (stable)")
            .option("-i, --id <id>", "ID of type to reference", addToList, [])
            .option("-t, --type <typeName>", "Type name in format service.type")
            .option("-n, --name <name>", "Name of reference")
            .option("--one", "Reference one other type only (--id specified once only)")
            .action((typeName, id, opts) => {
                cmdInfo = {
                    typeName: typeName,
                    id: id,
                    opts: opts
                };
                if (opts.id.length === 0) {
                    throw new Error("Option --id required");
                }
                if (!opts.type) {
                    throw new Error("Option --type required");
                }
                if (!opts.name) {
                    throw new Error("Option --name required");
                }
                if (opts.one && opts.id.length !== 1) {
                    throw new Error("--one implies that --id is specified once");
                }
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
                    action: "addref",
                    data: {
                        ref: {
                            id: args.opts.one ? args.opts.id[0] : args.opts.id,
                            type: args.opts.type,
                            name: args.opts.name
                        }
                    }
                }
            };
            log.verbose(`Add ref to type ${args.typeName} with data ${JSON.stringify(cmdJson.data.data.ref)}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
