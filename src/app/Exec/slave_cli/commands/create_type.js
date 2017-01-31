"use strict";

const log = require("../log");

const dataDecoders = {
    json: JSON.parse
};

const DATA_FORMATS = Object.keys(dataDecoders);

let cmdInfo;

const addToList = (val, memo) => {
    memo.push(val);

    return memo;
};

const oneOf = (choices, choice) => {
    if (choices.indexOf(choice) !== -1) {
        return choice;
    }
    throw new Error(`Specified option argument ${choice} not one of ${choices.join(", ")}`);
};

module.exports = {
    init: (commander) => {
        commander
            .command("create_type <typeName>")
            .description("Create type")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .option("-d, --data <string>", "New type content")
            .option("-f, --format <json>", "Data format", oneOf.bind(null, DATA_FORMATS), "json")
            .action((typeName, opts) => {
                let data;
                try {
                    data = dataDecoders[opts.format](opts.data);
                } catch (error) {
                    throw new Error(`data cannot be loaded with format ${opts.format}`);
                }
                cmdInfo = {
                    typeName: typeName,
                    data: data,
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
                action: "type_create",
                data: {
                    typeName: args.typeName,
                    data: args.data
                }
            };
            if (args.opts && args.opts.tag) {
                cmdJson.data.data.tags = args.opts.tag;
            }
            log.verbose(`Create type ${args.typeName} with data ${JSON.stringify(args.data)}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
