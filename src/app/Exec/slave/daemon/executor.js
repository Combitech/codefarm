"use strict";

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");

class Executor extends AsyncEventEmitter {
    constructor(logfile) {
        super();

        this.logfile = logfile;
        this.process = null;
        this.timeout = null;
    }

    async run(script, env = {}, data = {}, dataFileName = "data.json") {
        try {
            if (this.process) {
                throw new Error("A process is already running");
            }

            this._log(`Running chmod 0744 on ${script}`);
            await fs.chmodAsync(script, parseInt("0744", 8));

            const cwd = path.dirname(script);
            const dataFilePath = path.join(cwd, dataFileName);
            this._log(`Storing data to file ${dataFilePath}`);
            await fs.writeFileAsync(dataFilePath, JSON.stringify(data, null, 2));

            this._log(`Executing ${script} with env ${JSON.stringify(env)}`);
            let nextOutputLineNr = 0;
            this.process = spawn(script, [], {
                cwd: cwd,
                env: Object.assign({}, process.env, env),
                detached: true,
                stdio: [ "pipe", "pipe", "pipe" ]
            });

            this.process.stdout.on("data", (line) => {
                const data = {
                    msg: line.toString(),
                    lineNr: nextOutputLineNr++
                };
                this.emit("stdout", data);
            });

            this.process.stderr.on("data", (line) => {
                const data = {
                    msg: line.toString(),
                    lineNr: nextOutputLineNr++
                };
                this.emit("stderr", data);
            });

            this.process.on("close", (code) => {
                this.process = null;
                this._log(`Execution ended with code ${code}`);
                this.emit("close", code);
            });
        } catch (error) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            const errorString = `Error: Failed to run script: ${error.toString()}`;

            this._log(errorString);
            this.emit("error", errorString);
            this.emit("close", -1);
        }
    }

    kill() {
        if (!this.process) {
            return;
        }

        this._log("Sending SIGTERM to process");
        // TODO: We kill the process group here to kill
        // all possible children, is that desired every time?
        // And this solution only works on *NIX systems
        process.kill(-this.process.pid);
        // this.process.kill(this.process.pid);

        this.timeout = setTimeout(() => {
            this.timeout = null;

            if (!this.process) {
                return;
            }

            this._log("Sending SIGKILL to process");
            process.kill(-this.process.pid, "SIGKILL");
            // this.process.kill("SIGKILL");
        }, 10000);
    }

    async _write(msg, encoding = "utf8") {
        if (!this.process) {
            return;
        }

        return new Promise((resolve) => this.process.stdin.write(msg, encoding, resolve));
    }

    async writeln(msg, encoding = "utf8") {
        return this._write(`${msg}\n`, encoding);
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  EXE  ${line}\n`);
    }
}

module.exports = { Executor };
