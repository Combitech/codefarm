"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const path = require("path");
const rp = require("request-promise");
const { exec: config } = require("../app/Mgmt/cfg/config.json");

const argv = yargs
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Job id",
    type: "string"
})
.option("c", {
    alias: "create",
    describe: "Create",
    type: "boolean",
    default: false
})
.option("n", {
    alias: "name",
    describe: "Name",
    type: "string",
    default: "I am the job"
})
.option("criteria", {
    describe: "Criteria",
    type: "string"
})
.option("s", {
    alias: "script",
    describe: "Script file to upload",
    type: "string",
    default: ""
})
.option("baselinename", {
    describe: "Baseline name",
    type: "string",
    default: "myBaseline-1"
})
.option("baselineid", {
    describe: "Baseline id",
    type: "string",
    default: "myBaseline-1-id"
})
.option("collectorname", {
    describe: "Collector name",
    type: "string",
    default: "commits"
})
.option("collectortype", {
    describe: "Collector type",
    type: "string",
    default: "coderepo.revision"
})
.option("cids", {
    alias: "collectedids",
    describe: "Collected ids",
    type: "array",
    default: []
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${config.web.port}`;
    console.log(`Job command`);
    let getJob = true;

    if (argv.create) {
        getJob = false;
        const scriptContent = await fs.readFileAsync(argv.script);
        if (!argv.criteria) {
            throw "--criteria required if create"
        }
        if (!argv.script) {
            throw "--script required if create"
        }
        const result = await rp.post({
            url: `${baseUrl}/job`,
            json: true,
            body: {
                name: argv.name,
                criteria: argv.criteria,
                script: new Buffer(scriptContent).toString(),
                baseline: {
                    _id: argv.baselineid,
                    name: argv.baselinename,
                    content: [
                        {
                            _ref: true,
                            name: argv.collectorname,
                            type: argv.collectortype,
                            id: argv.collectedids
                        }
                    ]
                }
            }
        });

        console.dir(result, { colors: true, depth: null });
    }

    if (getJob) {
        let url = `${baseUrl}/job`;
        if (argv.id) {
            console.log(`Get job ${argv.id}`);
            url = url.concat(`/${argv.id}`);
        } else {
            console.log(`List jobs`);
        }
        const result = await rp.get({ url: url, json: true });
        console.dir(result, { colors: true, depth: null });
    }
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
