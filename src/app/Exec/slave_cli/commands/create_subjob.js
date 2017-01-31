"use strict";

const log = require("../log");
const cmdCreateType = require("./create_type");

const ALLOWED_KINDS = [ "test", "build" ];
const ALLOWED_STATUS = [ "ongoing", "success", "fail", "skip" ];

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
            .command("create_subjob <kind> <name> <status>")
            .description(
                "Create subjob (stable)\n" +
                `    kind - Any of ${ALLOWED_KINDS.join(",")}\n` +
                `    status - Any of ${ALLOWED_STATUS.join(",")}`)
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .option("-r, --result <json>", "Result data", JSON.parse)
            .action((kind, name, status, opts) => {
                oneOf(ALLOWED_KINDS, kind);
                oneOf(ALLOWED_STATUS, status);
                cmdInfo = {
                    kind: kind,
                    name: name,
                    status: status,
                    opts: opts
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com) => {
        if (cmdInfo) {
            log.verbose(`Create subjob ${cmdInfo.name} of kind ${cmdInfo.kind} with status ${cmdInfo.status}`);
            const createTypeData = {
                typeName: "exec.subjob",
                data: {
                    name: cmdInfo.name,
                    kind: cmdInfo.kind,
                    status: cmdInfo.status
                },
                opts: {}
            };
            if (cmdInfo.opts && cmdInfo.opts.result) {
                createTypeData.data.result = cmdInfo.opts.result;
            }
            if (cmdInfo.opts && cmdInfo.opts.tag) {
                createTypeData.opts.tag = cmdInfo.opts.tag;
            }
            cmdInfo = null;

            return cmdCreateType.run(com, createTypeData);
        }
    }
};
