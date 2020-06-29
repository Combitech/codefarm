"use strict";

const log = require("../log");

let cmdInfo;
const ALLOWED_STATE = [ "fail", "none", "pass" ];

const oneOf = (choices, choice) => {
    if (choices.indexOf(choice) !== -1) {
        return choice;
    }
    throw new Error(`Specified option argument ${choice} not one of ${choices.join(", ")}`);
};

module.exports = {
    init: (commander) => {
        commander
            .command("set_verified <id> <state>")
            .description("Set verified state of a code revision\n" +
                         `    state - Any of ${ALLOWED_STATE.join(",")}`)
            .action((id, state) => {
                oneOf(ALLOWED_STATE, state);
                cmdInfo = {
                    id: id,
                    state: ALLOWED_STATE.indexOf(state) - 1 /* Workaround due to -1 being iterpreted as option */
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
                action: "revision_verified",
                data: {
                    revisionId: args.id,
                    state: args.state
                }
            };
            console.log(`Setting code revision ${args.id} verified state to ${args.state}`);
            log.verbose(`Setting code revision ${args.id} verified state to ${args.state}`);
            cmdInfo = null;

            return com.request(cmdJson);
        }
    }
};
