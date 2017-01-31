"use strict";

class StreamConverter {
    constructor(stream) {
        this.stream = stream;
    }

    toString() {
        return new Promise((resolve, reject) => {
            let output = "";

            this.stream.on("readable", () => {
                const data = this.stream.read();

                if (data === null) {
                    return resolve(output);
                }

                output += data.toString();
            });

            this.stream.on("error", reject);
        });
    }

    toBuffer() {
        return new Promise((resolve, reject) => {
            const bufs = [];

            this.stream.on("readable", () => {
                const data = this.stream.read();

                if (data === null) {
                    return resolve(Buffer.concat(bufs));
                }

                bufs.push(data);
            });

            this.stream.on("error", reject);
        });
    }
}

module.exports = StreamConverter;
