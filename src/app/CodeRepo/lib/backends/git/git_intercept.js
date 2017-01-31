"use string";

const { Transform } = require("stream");
const list = require("git-list-pack");

// https://github.com/git/git/blob/master/Documentation/technical/pack-protocol.txt

class GitIntercept extends Transform {
    constructor(params) {
        super();

        this.params = params;

        this.state = "unknown";
        this.buffer = Buffer.alloc(0);
        this.halted = !!params.halted;
        this.outQueue = [];
        this.lock = Promise.resolve();

        this.list = list();

        if (this.params.commitMessage) {
            this.list.on("data", (data) => {
                // https://github.com/git/git/blob/master/cache.h#L388
                // 1 === OBJ_COMMIT
                if (data.type === 1 && this.params.commitMessage) {
                    if (!this.params.commitMessage(data.data.toString("utf8"))) {
                        // An error occured and we should not call this again
                        this.params.commitMessage = false;
                    }
                }
            });
        }
    }

    halt() {
        this.halted = true;
    }

    unhalt() {
        this.halted = false;

        this.params.debug && console.log("outQueue.length", this.outQueue.length);

        for (const data of this.outQueue) {
            this._tryPush(data);
        }

        this.outQueue.length = 0;
    }

    _tryPush(data) {
        if (this.halted) {
            this.outQueue.push(data);
        } else {
            this.lock = this.lock
            .then(() => this._processData(data))
            .then((buffer) => {
                if (buffer !== false) {
                    this.push(buffer);
                }
            });
        }
    }

    async _processData(data) {
        if (data.type === "buffer") {
            return data.data;
        } else if (data.type === "line") {
            const line = data.data.toString("utf8");
            const newLine = await this.params.lineTransform(line);

            if (newLine !== false) {
                const lenLength = 4;
                const newLineLen = newLine.length + lenLength;
                const newLenString = ("0".repeat(lenLength) + newLineLen.toString(16)).slice(-lenLength);

                const pushBuffer = new Buffer(newLenString + newLine);
                this.params.debug && console.log("pushBuffer", pushBuffer);

                return pushBuffer;
            }

            return false;
        }

        throw new Error(`Unknown data type ${data.type}`);
    }

    _transform(data, encoding, callback) {
        this.buffer = Buffer.concat([ this.buffer, data ], this.buffer.length + data.length);

        this.params.debug && console.log("data", data);
        this.params.debug && console.log("data.length", data.length);

        while (!this._process()) {
            // Do nothing
        }

        this.lock.then(callback);
    }

    _send() {
        this.params.debug && console.log("state", this.state);

        if (this.state === "pack") {
            this.list.write(this.buffer);

            this._tryPush({ type: "buffer", data: this.buffer });
            this.buffer = Buffer.alloc(0);

            return true;
        } else if (this.state === "flush") {
            const flushLength = 4;
            const data = this.buffer.slice(0, flushLength);

            this._tryPush({ type: "buffer", data: data });
            this.state = "unknown";
            this.buffer = this.buffer.slice(flushLength);

            return this.buffer.length === 0;
        } else if (this.state === "line") {
            const lenLength = 4;
            const lenString = this.buffer.slice(0, lenLength).toString("utf8");
            const dataLength = parseInt(lenString, 16);

            this.params.debug && console.log("dataLength", dataLength);

            if (this.buffer.length >= dataLength) {
                const data = this.buffer.slice(lenLength, dataLength);

                this._tryPush({ type: "line", data: data });

                this.state = "unknown";
                this.buffer = this.buffer.slice(dataLength);

                return this.buffer.length === 0;
            }
        }

        return true;
    }

    _process() {
        if (this.state !== "unknown") {
            return this._send();
        } else if (this.buffer.length === 0) {
            return true;
        }

        const start = this.buffer.slice(0, 4).toString("utf8");

        this.params.debug && console.log("start", start.toString("utf8"));

        if (start === "PACK") {
            this.state = "pack";

            return this._send();
        } else if (start === "0000") {
            this.state = "flush";

            return this._send();
        }

        this.state = "line";

        return this._send();
    }
}

module.exports = GitIntercept;
