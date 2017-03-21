"use strict";

module.exports = async (argv) => {
    const flowIdTag = `step:flow:${argv.id}`;

    const defaultCollector = (
        criteria,
        limit = 1,
        name = "artifacts",
        collectType = "artifactrepo.artifact"
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
        visible = true
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
        visible: visible
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
        visible = true
    ) => defaultBlSpec(name, script, slaveCriteria, "", parentStepNames, visible);

    const baselineSpecs = [
        {
            _id: "ArtSelect",
            collectors: [
                defaultCollector(`!${flowIdTag}`)
            ]
        }, {
            _id: "DC",
            collectors: [
                defaultCollector(`${flowIdTag} AND !step:DC:success`)
            ]
        }, {
            _id: "Integrate",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:DC:success`)
            ]
        }, {
            _id: "ShortTest",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Integrate:success`)
            ]
        }, {
            _id: "LongTest",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:ShortTest:success`)
            ]
        }
    ];

    const randomDelayScript = `
        #!/bin/bash
        delay=$(shuf -i3-10 -n 1)
        echo "I will sleep $delay seconds"
        sleep $delay
        exit 0
    `;

    const defaultSlaveCriteria = "slave1";

    const steps = [
        tagBlSpec(
            "ArtSelect", `tags.push("${flowIdTag}");`, [], false
        ),
        slaveScriptBlSpec(
            "DC", randomDelayScript, defaultSlaveCriteria
        ),
        slaveScriptBlSpec(
            "Integrate", randomDelayScript, defaultSlaveCriteria, [ "DC" ]
        ),
        slaveScriptBlSpec(
            "ShortTest", randomDelayScript, defaultSlaveCriteria, [ "Integrate" ]
        ),
        slaveScriptBlSpec(
            "LongTest", randomDelayScript, defaultSlaveCriteria, [ "ShortTest" ]
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
