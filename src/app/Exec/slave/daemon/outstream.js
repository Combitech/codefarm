"use strict";

const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");

class OutStream extends AsyncEventEmitter {
    constructor(logfile) {
        super();

        this.logfile = logfile;
        this.buffer = [];
        this.stream = null;
        this.counter = 1;
        this.flushing = false;
    }

    async write(data) {
        this._log(`Add to buffer: ${JSON.stringify(data)}`);
        data._src = "daemon";
        this.buffer.push(data);

        await this._flush();
    }

    async ack(seq) {
        this._log(`Got ack for seq ${seq}`);

        for (const data of this.buffer) {
            if (data.seq === seq) {
                data.acked = true;
                break;
            }
        }

        await this._flush();
    }

    async _flush() {
        if (this.flushing) {
            return;
        }

        this._clearAcked();

        if (!this.stream) {
            this._log("Error: Can not flush, no stream set");

            return;
        }

        this._log(`Buffer length is ${this.buffer.length}`);

        for (const data of this.buffer) {
            if (data.seq) {
                continue;
            }

            data.seq = this.counter++;

            const line = JSON.stringify(data);

            this._log(`Write: ${line}`);
            if (!this.stream.write(`${line}\n`)) {
                this.flushing = false;

                return;
            }
        }

        if (this.isEmpty()) {
            this._log("Emitting drain event");
            await this.emit("drain");
        }

        this.flushing = false;
    }

    isEmpty() {
        return this.buffer.length === 0;
    }

    async setStream(stream) {
        this._log("Setting stream");
        this.stream = stream;

        this.stream.on("drain", () => {
            this._flush()
            .catch((error) => {
                this.emit("error", error);
            });
        });

        await this._flush();
    }

    unsetStream() {
        if (!this.stream) {
            return;
        }

        this._log("Unsetting stream");
        this.stream = null;

        this._clearAcked();

        for (const data of this.buffer) {
            delete data.seq;
        }
    }

    _clearAcked() {
        const len = this.buffer.length;
        this.buffer = this.buffer.filter((data) => !data.acked);
        const count = len - this.buffer.length;

        if (count > 0) {
            this._log(`Purged acked ${count} items from buffer`);
        }
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  OUT  ${line}\n`);
    }
}

module.exports = { OutStream };
