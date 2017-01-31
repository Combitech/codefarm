"use strict";

const log = require("../log");
const cmdCreateType = require("./create_type");
const cmdUploadArtifact = require("./upload_artifact");

let cmdInfo;

const addToList = (val, memo) => {
    memo.push(val);

    return memo;
};

module.exports = {
    init: (commander) => {
        commander
            .command("create_artifact <name> <repo>")
            .description("Create artifact (stable)")
            .option("-t, --tag <tag>", "Add extra tag", addToList, [])
            .option("--file <path>", "Upload artifact file to new artifact")
            .action((name, repo, opts) => {
                cmdInfo = {
                    name: name,
                    repo: repo,
                    opts: opts
                };
            });
    },
    isReady: () => cmdInfo, // Ready if cmdInfo has been set...
    run: async (com) => {
        if (cmdInfo) {
            log.verbose(`Create artifact ${cmdInfo.name} in repo ${cmdInfo.repo}`);
            let result = await cmdCreateType.run(com, {
                typeName: "artifactrepo.artifact",
                data: {
                    name: cmdInfo.name,
                    repository: cmdInfo.repo
                },
                opts: {
                    tag: cmdInfo.opts.tag
                }
            });

            if (cmdInfo.opts.file) {
                let artifactId;
                try {
                    artifactId = result.data._id;
                } catch (error) {
                    throw new Error("Unexpected create artifact response, can't parse _id");
                }

                result = await cmdUploadArtifact.run(com, {
                    id: artifactId,
                    path: cmdInfo.opts.file,
                    opts: {}
                });
            }
            cmdInfo = null;

            return result;
        }
    }
};
