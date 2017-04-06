"use strict";

const fs = require("fs-extra-promise");
const path = require("path");
const rp = require("request-promise");
const { exec: configExec } = require("./config.json");

const run = async () => {
    console.log("Adding a new slave");
    const result = await rp.post({
        url: `http://localhost:${configExec.web.port}/slave`,
        body: {
            uri: `ssh://${process.env.USER}@localhost/tmp/workspaces`,
            executors: 1,
            backend: "direct",
            privateKeyPath: path.join("/external_data", "id_rsa"),
            tags: [ "TheSlave" ]
        },
        json: true
    });

    await fs.ensureDirAsync("/tmp/workspaces");

    console.dir(result, { colors: true, depth: null });
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
