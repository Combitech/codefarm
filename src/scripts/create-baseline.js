"use strict";

const rp = require("request-promise");
const { baselinegen: configBaselineGen } = require("./config.json");

const run = async () => {
    console.log("Adding a new baseline specification");
    const result = await rp.post({
        url: `http://localhost:${configBaselineGen.web.port}/specification`,
        body: {
            _id: "CommitGateBaseline",
            collectors: [
                {
                    name: "commit",
                    collectType: "coderepo.revision",
                    criteria: "!CommitGate:success AND repository:MyGitRepository",
                    limit: 1,
                    latest: false
                }
            ]
        },
        json: true
    });

    console.dir(result, { colors: true, depth: null });
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
