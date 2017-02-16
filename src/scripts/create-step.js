"use strict";

const rp = require("request-promise");
const { flowctrl: configFlowCtrl } = require("./config.json");

const run = async () => {
    console.log("Adding a new flow step");
    const result = await rp.post({
        url: `http://localhost:${configFlowCtrl.web.port}/step`,
        body: {
            name: "CommitGate",
            flow: {
                _ref: true,
                id: "MyFlow",
                type: "flowctrl.flow"
            },
            concurrency: 1,
            baseline: {
                _ref: true,
                id: "CommitGateBaseline",
                type: "baselinegen.specification"
            },
            criteria: "TheSlave",
            script: "#!/bin/bash -e\n\necho 'This is a nice test'\n"
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
