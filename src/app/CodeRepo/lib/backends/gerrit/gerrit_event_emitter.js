"use strict";

const readline = require("readline");
const log = require("log");
const { AsyncEventEmitter } = require("emitter");

class GerritEventEmitter extends AsyncEventEmitter {
    constructor() {
        super();
        this.eventStreamOnline = false;
    }

    async start(streamStdout, streamStderr) {
        this.eventStreamOnline = true;
        streamStdout.on("close", async (code) => {
            this.eventStreamOnline = false;
            if (this.disposed) {
                // A close event is expected after dispose... Return without throwing...
                return;
            }
            throw new Error(`Gerrit event stream closed with exit code ${code}`);
        });

        // Log stderr...
        readline.createInterface({
            input: streamStderr,
            terminal: false
        }).on("line", (line) => {
            if (line.length === 0) {
                return;
            }
            this.emit("stderr-output", line);
        });

        readline.createInterface({
            input: streamStdout,
            terminal: false
        }).on("line", (line) => {
            if (line.length === 0) {
                return;
            }
            let event;
            try {
                event = JSON.parse(line);
            } catch (error) {
                log.error(`Error decoding gerrit event=${line}, error: ${error}`);
            }
            if (event) {
                /*
                 * The gerrit JSON event stream format is described here:
                 * https://review.openstack.org/Documentation/json.html
                 */
                log.info("Gerrit event received", event);
                this.emit(event.type, event);
            }
        });
    }

    async dispose() {
        this.disposed = true;
        this.removeAllListeners();
    }
}

module.exports = GerritEventEmitter;
