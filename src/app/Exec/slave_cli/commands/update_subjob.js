"use strict";

const log = require("../log");
const cmdUpdateType = require("./update_type");

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
            .command("update_subjob <id>")
            .description("Update subjob (stable)")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .option("-r, --result <json>", "Result data", JSON.parse)
            .option("-s, --status <status>", "Sub-job status", oneOf.bind(null, ALLOWED_STATUS))
            .action((id, opts) => {
                cmdInfo = {
                    id: id,
                    opts: opts
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com) => {
        if (cmdInfo) {
            log.verbose(`Update subjob ${cmdInfo.id}`);

            const res = cmdUpdateType.run(com, {
                id: cmdInfo.id,
                typeName: "exec.subjob",
                data: {
                    status: cmdInfo.opts.status,
                    result: cmdInfo.opts.result
                }
            });
            cmdInfo = null;

            return res;
        }
    }
};
