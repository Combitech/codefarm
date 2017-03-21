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
    ) => ({
        name: name,
        collectType: collectType,
        criteria: criteria,
        limit: limit,
        latest: false
    });

    const defaultBlSpec = (
        name,
        script = "",
        slaveCriteria = "",
        tagScript = "",
        parentStepNames = [],
        visible = true,
        workspaceName = "",
        workspaceCleanup = "keep"
    ) => ({
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
        visible: visible,
        workspaceName: workspaceName,
        workspaceCleanup: workspaceCleanup
    });

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
        visible = true,
        workspaceName = "",
        workspaceCleanup = "keep"
    ) => defaultBlSpec(name, script, slaveCriteria, "", parentStepNames, visible, workspaceName, workspaceCleanup);

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
                defaultCollector(`${flowIdTag} AND ((review:approved:1 AND !review:rejected:1) OR review:skip) AND !step:CG:success AND !merged`)
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
            _id: "Regression",
            collectors: [
                defaultCollector(`${flowIdTag} AND merged`)
            ]
        }, {
            _id: "Lint",
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

    const testScript = `
        #!/bin/bash -e
        /home/farmer/codefarm/ci/cf-clone-checkout.sh
        CLI=$\{PWD\}/cli.js
        pushd codefarm
        /home/farmer/codefarm/ci/cf-build.sh -C $\{CLI\}
        /home/farmer/codefarm/ci/cf-test.sh -C $\{CLI\}
        popd
        exit 0
    `;

    const lintScript = `
        #!/bin/bash -e
        /home/farmer/codefarm/ci/cf-clone-checkout.sh
        CLI=$\{PWD\}/cli.js
        pushd codefarm
        /home/farmer/codefarm/ci/cf-lint.sh -C $\{CLI\}
        popd
        exit 0
    `;

    const mergeScript = await fs.readFileAsync(path.join(__dirname, "..", "jobs", "merge_github_revision.sh"), { encoding: "utf8" });
    const dummyScript = `
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
            "CG", testScript, defaultSlaveCriteria, "", "remove_on_success"
        ),
        slaveScriptBlSpec(
            "Merge", mergeScript, defaultSlaveCriteria, [ "CG" ], "", "remove_on_success"
        ),
        slaveScriptBlSpec(
            "Build", dummyScript, defaultSlaveCriteria, [ "Merge" ], "", "remove_on_success"
        ),
        slaveScriptBlSpec(
            "Regression", testScript, defaultSlaveCriteria, [ "Merge" ], "", "remove_on_success"
        ),
        slaveScriptBlSpec(
            "Lint", lintScript, defaultSlaveCriteria, [ "Merge" ], "", "remove_on_success"
        ),
        slaveScriptBlSpec(
            "Deliver", dummyScript, defaultSlaveCriteria, [ "Build" ], "", "remove_on_success"
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
