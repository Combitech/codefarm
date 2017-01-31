"use strict";

const fs = require("fs");
const path = require("path");
const rp = require("request-promise");
const { flowctrl: configFlowCtrl } = require("../app/Mgmt/cfg/config.json");

const run = async () => {
    console.log(`Adding a new flow step`);
    const result = await rp.post({
        url: `http://localhost:${configFlowCtrl.web.port}/step`,
        body: {
            name: "CommitGate",
            flow: "MyFlow",
            concurrency: 1,
            baseline: "CommitGateBaseline",
            criteria: "TheSlave",
            script: "#!/bin/bash -e\n\necho 'This is a nice test'\n"
        },
        json: true
    });

    console.dir(result, { colors: true, depth: null });
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
