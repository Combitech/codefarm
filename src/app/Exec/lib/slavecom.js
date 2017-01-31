"use strict";

const readline = require("readline");
const { AsyncEventEmitter } = require("emitter");

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
        // console.log(line);

        const obj = JSON.parse(line);

        if (obj.seq) {
            const line = JSON.stringify({ type: "ack", ack: obj.seq, seq: this.counter++ });
            this.output.write(`${line}\n`);
        }

        await this.emit(obj.type, obj);
    }

    sendCommand(action, data = {}) {
        const line = JSON.stringify({ type: "cmd", action: action, data: data, seq: this.counter++ });
        this.output.write(`${line}\n`);
    }

    async destroy() {
        this.rl.close();
    }
}

module.exports = { SlaveCom };
