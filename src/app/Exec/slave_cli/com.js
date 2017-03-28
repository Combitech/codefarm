"use strict";

const net = require("net");
const log = require("./log");
const { AsyncEventEmitter } = require("emitter");
const { v4: uuid } = require("uuid");

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
     * @param {Object} [opts] Options
     * @param {String} [opts.encoding] How to serialize data sent to socket
     * @param {String} [opts.useContextId] Add contextId to request and assert same in response
     * @return {Object} Request response
     */
    async request(data, opts = {}) {
        opts = opts || {};
        opts.encoding = opts.encoding || "json";
        opts.useContextId = opts.hasOwnProperty("useContextId") ? opts.useContextId : true;
        opts.throwOnError = opts.hasOwnProperty("throwOnError") ? opts.throwOnError : true;
        await this.connect();
        if (opts.useContextId) {
            data.contextId = uuid();
        }
        const msg = this._encode(data, opts.encoding);
        await this._send(msg);
        await this._waitRemoteEnd();
        const rxData = await this._receive();
        await this.disconnect();

        const response = await this._decode(rxData, opts.encoding);
        if (data.contextId) {
            if (data.contextId !== response.contextId) {
                const error = new Error(`Unexpected response contextId ${response.contextId} received. Expected ${data.contextId}.`);
                log.error(`com: ${error.message}`, data, response);
                if (opts.throwOnError) {
                    throw error;
                }
            }
        }

        return response;
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
