"use strict";

const path = require("path");
// yargs doesn't work with webpack, use commander instead...
const { Command } = require("commander");
// Create new instance to not conflict with mocha singleton during test...
let commander;

const { version } = require("../package.json");
const log = require("./log");
const ComClient = require("./com");
const outputFormatter = require("./output_formatter");
const jsonQuery = require("./json_query");
const fs = require("fs-extra-promise");

const commands = [
    require("./commands/read_type"),
    require("./commands/create_type"),
    require("./commands/update_type"),
    require("./commands/tag_type"),
    require("./commands/ref_type"),
    require("./commands/upload_log"),
    require("./commands/create_artifact"),
    require("./commands/upload_artifact"),
    require("./commands/create_subjob"),
    require("./commands/update_subjob"),
    require("./commands/merge_revision"),
    require("./commands/load_file")
];

const DEFAULT_SOCKET_TIMEOUT = 5000;
const DEFAULT_OUTPUT_FORMAT = "json";
const DEFAULT_QUERY_ENGINE = "jsonpath";

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
    init: () => {
        commander = new Command();
        commander
            .version(version)
            .option(
                "--format <fmt>",
                `Output format specified by one of ${outputFormatter.FORMATS.join(", ")}, defaults is ${DEFAULT_OUTPUT_FORMAT}`,
                oneOf.bind(null, outputFormatter.FORMATS),
                DEFAULT_OUTPUT_FORMAT
            )
            .option(
                "-q, --query <str>",
                "Query string interpreted by specified query engine",
                addToList,
                []
            )
            .option(
                "--queryEngine <engine>",
                `Query engine for interpreting query option as one of ${jsonQuery.ENGINES.join(", ")}, defaults is ${DEFAULT_QUERY_ENGINE}`,
                oneOf.bind(null, jsonQuery.ENGINES),
                DEFAULT_QUERY_ENGINE
            )
            .option(
                "--port <port>",
                "Command socket port"
            )
            .option(
                "--timeout <seconds>",
                `Command socket timeout in seconds, defaults is ${DEFAULT_SOCKET_TIMEOUT}`,
                DEFAULT_SOCKET_TIMEOUT
            )
            .option("-v, --verbose", "Be more verbose", () => {
                log.setVerbose();
            });
        for (const cmd of commands) {
            cmd.init(commander);
        }
    },
    parseArgs: (argv) => {
        commander.parse(argv);
    },
    run: async (comClient) => {
        const readyCmd = commands.find((cmd) => cmd.isReady());
        let config = commander;
        let res = "";

        if (readyCmd) {
            if (!comClient) {
                const content = await fs.readFileAsync(path.join(__dirname, "cliConfig.json"));
                config = Object.assign({}, commander, JSON.parse(content));

                if (!config.port) {
                    throw new Error("No port specified");
                }
            }

            const com = comClient || new ComClient(config.port, config.timeout * 1000);
            let responseData;
            try {
                const data = await readyCmd.run(com);
                if (data.type === "response") {
                    responseData = data.data;
                } else if (data.type === "error") {
                    throw new Error(`Command error respose "${data.msg}", data=${JSON.stringify(data)}`);
                } else {
                    throw new Error(`Command not OK, data=${JSON.stringify(data)}`);
                }
            } catch (err) {
                throw err;
            }

            if (config.query.length > 0) {
                let queryResults = [];
                for (const query of config.query) {
                    try {
                        const queryRes = jsonQuery.query(responseData, query, config.queryEngine);
                        queryResults = queryResults.concat(queryRes);
                    } catch (err) {
                        throw new Error(`Query "${query}" error: ${err.message}`);
                    }
                }
                res = outputFormatter.format(queryResults, config.format);
            } else {
                res = outputFormatter.format(responseData, config.format);
            }
        } else {
            res = await new Promise((resolve) =>
                commander.outputHelp((helpStr) => {
                    resolve(helpStr);

                    return "";
                })
            );
        }

        return res;
    }
};
