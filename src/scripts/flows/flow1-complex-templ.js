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
            _id: "Test3",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test4",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test5",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test6",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test7",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Test8",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:CG:success`)
            ]
        }, {
            _id: "Join-3-4",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Test3:success AND step:Test4:success`)
            ]
        }, {
            _id: "Join-5-6",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Test5:success AND step:Test6:success`)
            ]
        }, {
            _id: "Join-7-8",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Test7:success AND step:Test8:success`)
            ]
        }, {
            _id: "Join-1-2-3-4",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Join-1-2:success AND step:Join-3-4:success`)
            ]
        }, {
            _id: "Join-5-6-7-8",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Join-5-6:success AND step:Join-7-8:success`)
            ]
        }, {
            _id: "Join",
            collectors: [
                defaultCollector(`${flowIdTag} AND step:Join-1-2-3-4:success AND step:Join-5-6-7-8:success`)
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
            "Test3", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test4", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test5", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test6", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test7", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Test8", defaultScript, defaultSlaveCriteria, [ "CG" ]
        ),
        slaveScriptBlSpec(
            "Join-3-4", defaultScript, defaultSlaveCriteria, [ "Test3", "Test4" ]
        ),
        slaveScriptBlSpec(
            "Join-5-6", defaultScript, defaultSlaveCriteria, [ "Test5", "Test6" ]
        ),
        slaveScriptBlSpec(
            "Join-7-8", defaultScript, defaultSlaveCriteria, [ "Test7", "Test8" ]
        ),
        slaveScriptBlSpec(
            "Join-1-2-3-4", defaultScript, defaultSlaveCriteria, [ "Join-1-2", "Join-3-4" ]
        ),
        slaveScriptBlSpec(
            "Join-5-6-7-8", defaultScript, defaultSlaveCriteria, [ "Join-5-6", "Join-7-8" ]
        ),
        slaveScriptBlSpec(
            "Join", defaultScript, defaultSlaveCriteria, [ "Join-1-2-3-4", "Join-5-6-7-8" ]
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
