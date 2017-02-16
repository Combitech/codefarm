"use strict";

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
            _id: "CG",
            collectors: [
                defaultCollector(`${flowIdTag} AND !step:CG:success`)
            ]
        }, {
            _id: "Test1",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test2",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Join-1-2",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Test1:success AND step:Test2:success`)
            ]
        }, {
            _id: "Join",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Join-1-2:success`)
            ]
        }
    ];

    const defaultScript = `
        #!/bin/bash
        delay=$(shuf -i0-3 -n 1)
        echo "I will sleep $delay seconds"
        sleep $delay
        exit 0
    `;
    const defaultSlaveCriteria = "slave1";

    const steps = [
        tagBlSpec(
            "Select", `tags.push("${flowIdTag}");`, [], false
        ),
        slaveScriptBlSpec(
            "CG", defaultScript, defaultSlaveCriteria
        ),
        slaveScriptBlSpec(
            "Test1", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test2", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Join-1-2", defaultScript, defaultSlaveCriteria, [ "Test1", "Test2" ]
        ),
        slaveScriptBlSpec(
            "Join", defaultScript, defaultSlaveCriteria, [ "Join-1-2" ]
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
