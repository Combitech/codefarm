"use strict";

const fs = require("fs-extra-promise");
const yargs = require("yargs");
const rp = require("request-promise");
const { artifactrepo: configArtifactRepo } = require("./config.json");

const argv = yargs
.help("help")
.strict()
.option("r", {
    alias: "repo",
    describe: "Artifact repository name",
    type: "string",
    requiresArg: true,
    default: "MyArtifactRepository"
})
.option("n", {
    alias: "name",
    describe: "Artifact name",
    type: "string",
    requiresArg: true,
    default: "Artifact1"
})
.option("v", {
    alias: "version",
    describe: "Explicit artifact version",
    type: "string",
    requiresArg: true,
    default: null
})
.option("f", {
    alias: "file",
    describe: "File to upload",
    type: "string",
    requiresArg: true,
    default: null
})
.argv;

const run = async () => {
    const baseUrl = `http://localhost:${configArtifactRepo.web.port}`;
    console.log("Adding a new artifact repository");
    const result = await rp.post({
        url: `${baseUrl}/artifact`,
        body: {
            name: argv.name,
            repository: argv.repo,
            version: argv.version
        },
        json: true
    });

    console.dir(result, { colors: true, depth: null });

    if (result.result === "success" && argv.file) {
        const artifactId = result.data._id;
        console.log(`Uploading file ${argv.file} to artifact ${artifactId}`);
        const artifactContent = await fs.readFileAsync(argv.file);
        const uploadResult = await rp.post({
            url: `${baseUrl}/artifact/${artifactId}/upload`,
            json: true,
            formData: {
                artifact: new Buffer(artifactContent)
            }
        });

        console.dir(uploadResult, { colors: true, depth: null });
    }
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
