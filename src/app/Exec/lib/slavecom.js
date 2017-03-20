"use strict";

const readline = require("readline");
const { AsyncEventEmitter } = require("emitter");

/** Handles communication with the slave from a master perspective
 * In other words, input refers to data from slave and
 * output refers to data sent to the slave.
 */
class SlaveCom extends AsyncEventEmitter {
    constructor(output, input) {
        super();

        this.output = output;
        this.input = input;
        this.buffer = "";
        this.counter = 1;

        this.rl = readline.createInterface({
            input: input,
            terminal: false
        });

        this.rl.on("line", (line) => {
            if (line.length === 0) {
                return;
            }

            this._parse(line)
            .catch((error) => {
                this.emit("failure", error, line)
                .catch(() => {});
            });
        });

        this.rl.on("close", () => {
            // TODO: Do we need to handle this?
        });
    }

    async _parse(line) {
        // console.log("Line from slave:", line);

        const obj = JSON.parse(line);

        // Protect agains ssh configurations where stdin is echoed to stdout
        if (obj._src !== "master") {
            if (obj.seq) {
                const line = JSON.stringify({
                    type: "ack",
                    ack: obj.seq,
                    seq: this.counter++,
                    _src: "master"
                });
                this.output.write(`${line}\n`);
            }

            await this.emit(obj.type, obj);
        }
    }

    sendCommand(action, data = {}) {
        const line = JSON.stringify({
            type: "cmd",
            action: action,
            data: data,
            seq: this.counter++,
            _src: "master"
        });
        this.output.write(`${line}\n`);
    }

    async destroy() {
        this.rl.close();
    }
}

module.exports = { SlaveCom };
