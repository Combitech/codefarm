"use strict";

const rp = require("request-promise");
const {
    flowctrl: configFlowCtrl,
    baselinegen: configBaselineGen
} = require("./config.json");

const flowId = "Flow1";
const flowIdTag = `step:flow:${flowId}`;

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
        flow: flowId,
        concurrency: 1,
        baseline: name, // Use baseline with same name as step
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
        _id: "Join-1-2",
        collectors: [
            defaultCollector(`${flowIdTag} AND step:Test1:success AND step:Test2:success`)
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
        "Join-1-2", defaultScript, defaultSlaveCriteria, [ "Test1", "Test2" ]
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

const run = async () => {
    const restCreateType = async (uri, type, data, verbose = false) => {
        const url = `${uri}/${type}`;
        console.log(`Creating ${type} (post to ${url})`);

        const result = await rp.post({
            url: url,
            body: data,
            json: true
        });
        if (result.result !== "success") {
            console.error("Failed!");
            console.dir(result, { colors: true, depth: null });

            return null;
        } else if (verbose) {
            console.dir(result, { colors: true, depth: null });
        }

        return result.data;
    };

    const flowCtrlCreate = async (type, data) =>
        restCreateType(`http://localhost:${configFlowCtrl.web.port}`, type, data);

    const baselineGenCreate = async (type, data) =>
        restCreateType(`http://localhost:${configBaselineGen.web.port}`, type, data);

    // Create baselinegen stuff
    for (const blSpec of baselineSpecs) {
        await baselineGenCreate("specification", blSpec);
    }

    // Create flowctrl stuff
    await flowCtrlCreate("flow", {
        _id: flowId,
        description: `Flow with id ${flowId}`
    });

    const stepIds = {};
    for (const step of steps) {
        step.parentSteps = step.parentStepNames.map((stepName) => stepIds[stepName]);
        const data = await flowCtrlCreate("step", step);
        stepIds[step.name] = data._id;
    }

    console.log("done");
};

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
