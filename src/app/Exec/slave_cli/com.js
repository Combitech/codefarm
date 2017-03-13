"use strict";

const net = require("net");
const log = require("./log");
const { AsyncEventEmitter } = require("emitter");

let client;

class ComClient extends AsyncEventEmitter {
    constructor(port, timeout = 0) {
        super();
        this._port = port;
        this._timeout = timeout;
        this._rxQueue = [];
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this._client = new net.Socket();
            this._client.setTimeout(this._timeout);
            this._client.setNoDelay();
            this._remoteEnded = false;
            const connectOpts = {
                port: this._port
            };
            log.verbose("com: Will connect to socket using options", connectOpts);

            this._client.on("end", () => {
                this._remoteEnded = true;
                this.emit("remote_end");
            });

            this._client.on("error", (err) => {
                reject(err);
            });

            this._client.on("timeout", () => {
                client.destroy(new Error("Socket timeout"));
            });

            this._client.on("data", (data) => {
                log.verbose("com: Command socket got data", data.toString());
                this._rxQueue.push(data.toString());
                this.emit("data", data);
            });

            this._client.connect(connectOpts, () => {
                log.verbose("com: Connected to command socket");
                resolve();
            });
        });
    }

    async disconnect() {
        this._client.end();
        await this._waitRemoteEnd();
    }

    /** Write a request to command socket and wait for response.
     * Connection is closed when done.
     * @param {Object} data Data to send, will be serialized as a JSON string
     * @param {String} encoding How to serialize data sent to socket
     * @return {Object} Request response
     */
    async request(data, encoding = "json") {
        await this.connect();
        const msg = this._encode(data, encoding);
        await this._send(msg);
        await this._waitRemoteEnd();
        const rxData = await this._receive();
        await this.disconnect();

        return this._decode(rxData, encoding);
    }

    async _send(msg) {
        log.verbose("com: Will send", msg);
        await new Promise((resolve) =>
            this._client.write(`${msg}\n`, "utf8", resolve));
    }

    async _receive() {
        // Extract all data and empty queue
        const rxData = this._rxQueue.slice(0);
        this._rxQueue.length = 0;

        log.verbose("com: Received data", JSON.stringify(rxData));

        return rxData.join("\n");
    }

    async _waitRemoteEnd() {
        if (!this._remoteEnded) {
            await new Promise((resolve) => this.once("remote_end", resolve));
        }
    }

    _encode(data, encoding) {
        let encodedData = data;
        if (encoding === "json") {
            encodedData = JSON.stringify(data);
        }

        return encodedData;
    }

    _decode(msg, encoding) {
        let decodedData = msg;
        if (encoding === "json") {
            decodedData = JSON.parse(msg);
        }

        return decodedData;
    }
}

module.exports = ComClient;
