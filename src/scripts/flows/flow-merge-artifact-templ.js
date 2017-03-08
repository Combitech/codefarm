"use strict";

const fs = require("fs-extra-promise");
const path = require("path");

module.exports = async (argv) => {
    const flowIdTag = `step:flow:${argv.id}`;

    const defaultCollector = (
        criteria,
        limit = 1,
        name = "commits",
        collectType = "coderepo.revision"
    ) => {
        return {
            name: name,
            collectType: collectType,
            criteria: criteria,
            limit: limit,
            latest: false
        };
    };

    const defaultBlSpec = (
        name,
        script = "",
        slaveCriteria = "",
        tagScript = "",
        parentStepNames = [],
        visible = true
    ) => {
        return {
            name: name,
            flow: {
                _ref: true,
                id: argv.id,
                type: "flowctrl.flow"
            },
            concurrency: 1,
            baseline: {
                _ref: true,
                id: name, // Use baseline with same name as step
                type: "baselinegen.specification"
            },
            criteria: slaveCriteria,
            script: script,
            tagScript: tagScript,
            parentStepNames: parentStepNames,
            visible: visible
        };
    };

    const tagBlSpec = (
        name,
        tagScript = "",
        parentStepNames = [],
        visible = true
    ) => defaultBlSpec(name, "", "", tagScript, parentStepNames, visible);

    const slaveScriptBlSpec = (
        name,
        script = "",
        slaveCriteria = "",
        parentStepNames = [],
        visible = true
    ) => defaultBlSpec(name, script, slaveCriteria, "", parentStepNames, visible);

    const baselineSpecs = [
        {
            _id: "Select",
            collectors: [
                defaultCollector(`!${flowIdTag}`)
            ]
        }, {
            _id: "CG",
            collectors: [
                defaultCollector(`${flowIdTag} AND !step:CG:success`)
            ]
        }, {
            _id: "Merge",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Merge:success AND merged`)
            ]
        }, {
            _id: "Build",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Merge:success AND merged`)
            ]
        }
    ];

    const randomDelayScript = `
        #!/bin/bash
        delay=$(shuf -i0-3 -n 1)
        echo "I will sleep $delay seconds"
        sleep $delay
        exit 0
    `;

    const cgScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "status_from_commit_msg.sh"), { encoding: "utf8" });
    const mergeScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "merge_revision.sh"), { encoding: "utf8" });
    const buildScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "create_artifact.sh"), { encoding: "utf8" });

    const defaultSlaveCriteria = "slave1";

    const steps = [
        tagBlSpec(
            "Select", `tags.push("${flowIdTag}");`, [], false
        ),
        slaveScriptBlSpec(
            "CG", cgScript, defaultSlaveCriteria
        ),
        slaveScriptBlSpec(
            "Merge", mergeScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test", randomDelayScript, defaultSlaveCriteria, [ "Merge" ]
        ),
        slaveScriptBlSpec(
            "Build", buildScript, defaultSlaveCriteria, [ "Merge" ]
        )
    ];

    return {
        flow: {
            _id: argv.id,
            description: `Flow with id ${argv.id}`
        },
        specifications: baselineSpecs,
        steps: steps
    };
};
