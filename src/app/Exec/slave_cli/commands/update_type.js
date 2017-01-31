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
            .command("update_type <typeName> <id>")
            .description("Update type")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .option("-d, --data <string>", "Modified type content")
            .option("-f, --format <json>", "Data format", oneOf.bind(null, DATA_FORMATS), "json")
            .action((typeName, id, opts) => {
                let data;
                try {
                    data = dataDecoders[opts.format](opts.data);
                } catch (error) {
                    throw new Error(`data cannot be loaded with format ${opts.format}`);
                }
                cmdInfo = {
                    typeName: typeName,
                    id: id,
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
                action: "type_update",
                data: {
                    typeName: args.typeName,
                    id: args.id,
                    data: args.data
                }
            };
            log.verbose(`Update type ${args.typeName} with data ${JSON.stringify(args.data)}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
