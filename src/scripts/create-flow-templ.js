"use strict";

const rp = require("request-promise");
const yargs = require("yargs");
const {
    flowctrl: configFlowCtrl,
    baselinegen: configBaselineGen
} = require("./config.json");

const argv = yargs
.usage("Usage: $0")
.help("help")
.strict()
.option("i", {
    alias: "id",
    describe: "Flow id",
    type: "string",
    default: "Flow2"
})
.option("t", {
    alias: "template",
    describe: "Flow template",
    type: "string",
    required: true
})
.argv;

const flowTemplate = require(argv.template);

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

    const { flow, specifications, steps } = await flowTemplate(argv);

    // Create baselinegen stuff
    for (const blSpec of specifications) {
        await baselineGenCreate("specification", blSpec);
    }

    // Create flowctrl stuff
    await flowCtrlCreate("flow", flow);

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
