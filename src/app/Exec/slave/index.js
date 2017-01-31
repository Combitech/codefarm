"use strict";

const daemon = require("./daemon");
const proxy = require("./proxy");

const type = process.argv[2];
const workspace = process.argv[3];
const port = parseInt(process.argv[4], 10);

if (type === "client") {
    proxy.run(workspace, port, process.argv[1]);
} else if (type === "daemon") {
    daemon.run(workspace, port, process.argv[1]);
} else {
    console.error(`Unknown type ${type}`);
    process.exit(1);
}
