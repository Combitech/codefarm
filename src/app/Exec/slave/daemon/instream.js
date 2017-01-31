"use strict";

const readline = require("readline");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");

class InStream extends AsyncEventEmitter {
    constructor(logfile) {
        super();

        this.logfile = logfile;
        this.stream = null;
        this.rl = null;
    }

    async setStream(stream) {
        this._log("Setting stream");
        this.stream = stream;

        this.rl = readline.createInterface({
            input: stream,
            terminal: false
        });

        this.rl.on("line", (line) => {
            this._log(`Read: ${line}`);

            if (line.length === 0) {
                return;
            }

            try {
                const data = JSON.parse(line);

                this.emit("data", data)
                .catch((error) => {
                    this.emit("error", error);
                });
            } catch (error) {
                this.emit("error", error);
            }
        });
    }

    unsetStream() {
        if (!this.stream) {
            return;
        }

        this._log("Unsetting stream");
        if (this.rl) {
            this.rl.close();
        }

        this.rl = null;
        this.stream = null;
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  IN   ${line}\n`);
    }
}

module.exports = { InStream };
