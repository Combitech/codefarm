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
        script = false,
        slaveCriteria = false,
        tagScript = false,
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
        tagScript = false,
        parentStepNames = [],
        visible = true
    ) => defaultBlSpec(name, false, false, tagScript, parentStepNames, visible);

    const slaveScriptBlSpec = (
        name,
        script = false,
        slaveCriteria = false,
        parentStepNames = [],
        visible = true
    ) => defaultBlSpec(name, script, slaveCriteria, false, parentStepNames, visible);

    const baselineSpecs = [
        {
            _id: "Select",
            collectors: [
                defaultCollector(`!${flowIdTag}`)
            ]
        }, {
            // Detect pushes directly to master and (further down) set skip on previous steps
            _id: "PushToMaster",
            collectors: [
                defaultCollector(`${flowIdTag} AND merged AND !step:CG:skip AND !step:Merge:skip AND !step:CG:success AND !step:Merge:success`)
            ]
        }, {
            _id: "CG",
            collectors: [
                defaultCollector(`${flowIdTag} AND !step:CG:success AND !merged`)
            ]
        }, {
            _id: "Merge",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success AND !merged AND !step:Merge:success`)
            ]
        }, {
            _id: "Build",
            collectors: [
                defaultCollector(`${flowIdTag} AND merged`)
            ]
        }, {
            _id: "Deliver",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Build:success`)
            ]
        }
    ];

    const cgScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "clone_and_test_cf.sh"), { encoding: "utf8" });
    const mergeScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "merge_github_revision.sh"), { encoding: "utf8" });
    const buildScript = `
        #!/bin/bash
        delay=$(shuf -i3-10 -n 1)
        echo "I will sleep $delay seconds"
        sleep $delay
        exit 0
    `;

    const defaultSlaveCriteria = "slave1";

    const steps = [
        tagBlSpec(
            "Select", `tags.push("${flowIdTag}");`, [], false
        ),
        // Set CG and Merge steps as skipped (push to master detected)
        tagBlSpec(
            "PushToMaster", "tags.push(\"step:CG:skip\"); tags.push(\"step:Merge:skip\");", [], false
        ),
        slaveScriptBlSpec(
            "CG", cgScript, defaultSlaveCriteria
        ),
        slaveScriptBlSpec(
            "Merge", mergeScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Build", buildScript, defaultSlaveCriteria, [ "Merge" ]
        ),
        slaveScriptBlSpec(
            "Deliver", buildScript, defaultSlaveCriteria, [ "Build" ]
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
