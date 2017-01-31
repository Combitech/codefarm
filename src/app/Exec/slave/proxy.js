"use strict";

const path = require("path");
const fs = require("fs-extra-promise");
const { Daemon } = require("./proxy/daemon");
const { Server } = require("./proxy/server");

module.exports = {
    run: async (workspace, port, script) => {
        const logfile = path.join(workspace, "client.log");

        const log = (line) => {
            fs.appendFileSync(logfile, `${new Date()}  RUN  ${line}\n`);
        };

        const server = new Server(logfile);
        const daemon = new Daemon(logfile, workspace, port);

        daemon.on("status", async (status, msg) => {
            log(`Daemon connection status is: ${status} - ${msg}`);
            server.status(status, msg);
        });

        daemon.on("ready", async (ready, port) => {
            log(`Deamon ready state is: ${ready}, port ${port}`);
            server.ready(ready, port);
        });

        daemon.on("data", async (data) => {
            server.write(data);
        });

        daemon.on("close", async () => {
            server.end();
        });

        server.on("data", async (data) => {
            daemon.write(data);
        });

        server.on("close", async () => {
            daemon.end();
        });

        if (!await daemon.connect(script)) {
            log("Error: Failed to connect to daemon");

            return;
        }

        process.on("uncaughtException", (error) => {
            log("Error! Oh, no, we crashed hard!");
            log(error);
            log(error.stack);
            process.exit(error.code || 255);
        });
    }
};
