"use strict";

const path = require("path");
const yargs = require("yargs");
const rp = require("request-promise");
const config = require("./config.json");

const argv = yargs
.usage("Usage: $0 -s [service]")
.help("help")
.strict()
.option("s", {
    alias: "service",
    describe: "Target service (specify \"all\" to target all services)",
    type: "string",
    required: true,
    requiresArg: true,
    default: null
})
.option("r", {
    alias: "restart",
    describe: "Restart service",
    type: "boolean",
    default: false
})
.option("q", {
    alias: "query",
    describe: "Query service info",
    type: "boolean",
    default: false
})
.option("dot", {
    describe: "Queries all services and generates dot graph",
    type: "boolean",
    default: false
})
.argv;

const SERVICE_WILDCARD = "all";

const getPort = (serviceId) => {
    if (!(serviceId in config)) {
        return false;
    }

    return config[serviceId].web.port;
}

const getState = async (port) => {
    console.log("Command: Query");
    const state = await rp.get({
        url: `http://localhost:${port}/state`,
        json: true
    });

    console.log("Service state:");
    console.dir(state, { colors: true, depth: null });

    return state;
};

const restart = async (port) => {
    console.log("Command: Restart");
    const result = await rp.post({
        url: `http://localhost:${port}/state/X/restart`,
        body: {},
        json: true
    });

    console.log("Response:");
    console.dir(result, { colors: true, depth: null });

    return result;
}

const buildGraph = (status) => {
    const g = {
        nodes: [],
        links: []
    };

    if (status) {
        for (const serviceId of Object.keys(status)) {
            const serviceState = status[serviceId].stateResult[0];
            const uses = serviceState.uses;
            const provides = serviceState.provides;
            const state = serviceState.state;
            const node = {
                id: serviceId,
                state: state
            };
            g.nodes.push(node);
            if (uses) {
                for (const useKey of Object.keys(uses)) {
                    const use = uses[useKey];

                    // Add link if it doesn't already exist
                    const existingLinks = g.links.filter(
                        (l) => l.source === node.id && l.target === use.name
                    );
                    if (existingLinks.length === 0) {
                        g.links.push({
                            source: node.id,
                            target: use.name,
                            state: use.state
                        });
                    }
                }
            }
        }

        // Create temporary nodes for target links not notified yet...
        for (const l of g.links) {
            const targetId = l.target;
            let node = g.nodes.filter((n) => n.id === targetId)[0];
            if (!node) {
                node = {
                    id: targetId,
                    state: "not_created",
                };
                g.nodes.push(node);
            }
        }
    }

    return g;
};

const generateDotGraph = (g) => {
    const indent = "  ";
    let dot = "digraph states {\n";

    for (const l of g.links) {
        dot += `${indent}${l.source} -> ${l.target}\n`;
    }

    dot += "}\n";
    return dot;
}

const run = async () => {
    const serviceId = argv.service;
    const services = argv.service === SERVICE_WILDCARD ? Object.keys(config) : [argv.service];

    const status = {};
    for (const serviceId of services) {
        const port = getPort(serviceId);
        if (port) {
            console.log(`Service ${serviceId} on port ${port}`);
            status[serviceId] = {
                port: port
            };
            if (argv.query || argv.dot) {
                status[serviceId].stateResult = await getState(port);
            } else if (argv.restart) {
                status[serviceId].restartResult = await restart(port);
            } else {
                console.error("No command given!");
            }
        } else {
            console.log(`Service ${serviceId}: No port specified (config[${serviceId}].web.port)`);
        }
    }

    if (argv.dot) {
        const g = buildGraph(status);
        console.log("node graph:", JSON.stringify(g, null, 2));
        const dot = generateDotGraph(g);
        console.log("dot graph:");
        console.log(dot);
    }
}

run()
.catch((error) => {
    console.error(error);
    process.exit(255);
});
