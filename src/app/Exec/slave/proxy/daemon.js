"use strict";

const net = require("net");
const { spawn } = require("child_process");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");
const getPort = require("get-port");

class Daemon extends AsyncEventEmitter {
    constructor(logfile, workspace, port) {
        super();

        this.socket = null;
        this.logfile = logfile;
        this.workspace = workspace;
        this.port = port;
    }

    async _run(script) {
        const args = [ "--harmony_async_await", script, "daemon", this.workspace, this.port ];
        const child = spawn("node", args, {
            detached: true,
            stdio: "ignore"
        });

        child.unref();
    }

    _connect() {
        return new Promise((resolve, reject) => {
            this._log("Connecting to daemon");
            this.socket = net.createConnection({
                port: this.port,
                host: "localhost"
            }, () => {
                this._log("Connect event");

                this.socket.on("data", (data) => {
                    this._log(`Data from daemon: ${data.toString()}`);
                    this.emit("data", data.toString());
                });

                this.socket.on("close", () => {
                    this.socket = null;
                    this.port = 0;
                    this.emit("status", "offline", "Connection to daemon closed");
                    this.emit("close");
                });

                resolve();
            });

            this.socket.once("error", reject);
        });
    }

    async connect(deamonScript) {
        const retries = 10;
        const timeoutMs = 1000;

        try {
            if (this.port > 0) {
                await this.emit("status", "connecting", "Initial attempt to connect to daemon");

                try {
                    await this._connect();
                    await this.emit("status", "online", "Initial attempt on connecting to daemon");

                    return true;
                } catch (error) {}
            }

            this.port = await getPort();

            this._log(`Starting daemon on port ${this.port}`);
            this.emit("status", "connecting", `Starting daemon on port ${this.port}`);

            await this._run(deamonScript);

            await new Promise((resolve, reject) => {
                /* eslint-disable consistent-return */

                let iterations = retries;
                const interval = setInterval(async () => {
                    try {
                        await this.emit("status", "connecting", `Attempt ${retries - iterations} to connect to daemon on port ${this.port}`);

                        await this._connect();

                        clearInterval(interval);

                        return resolve();
                    } catch (error) {
                        iterations--;

                        if (iterations < 0) {
                            clearInterval(interval);
                            reject("Could not connect to daemon");
                        }
                    }
                }, timeoutMs);

                /* eslint-enable consistent-return */
            });

            this._log(`Connected to daemon on port ${this.port}`);
            await this.emit("status", "online", "Connected to daemon");
            await this.emit("ready", true, this.port);

            return true;
        } catch (error) {
            this._log(`Error: Failed to connect to daemon, ${error.toString()}`);
            await this.emit("status", "failed", error.toString());
            await this.emit("ready", false, this.port);
        }

        return false;
    }

    write(data) {
        if (this.socket) {
            this.socket.write(data);
        } else {
            this._log(`Tried to write to closed socket: ${data}`);
        }
    }

    end() {
        this._log("End called");

        if (!this.socket) {
            return;
        }

        this.socket.destroy();
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  DEA  ${line}\n`);
    }
}

module.exports = { Daemon };
