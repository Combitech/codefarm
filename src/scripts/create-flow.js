"use strict";

const fs = require("fs");
const path = require("path");
const rp = require("request-promise");
const { flowctrl: configFlowCtrl } = require("../app/Mgmt/cfg/config.json");

const run = async () => {
    console.log(`Adding a new flow`);
    const result = await rp.post({
        url: `http://localhost:${configFlowCtrl.web.port}/flow`,
        body: {
            _id: "MyFlow",
            description: "A very nice flow"
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
