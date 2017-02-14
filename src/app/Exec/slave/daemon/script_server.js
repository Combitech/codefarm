"use strict";

const net = require("net");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");

class ScriptServer extends AsyncEventEmitter {
    constructor(name, logfile, portOrFile) {
        super();
        this.name = name;
        const port = (typeof portOrFile === "number") ? portOrFile : false;
        const namedSocket = (typeof portOrFile === "string") ? portOrFile : false;

        this.logfile = logfile;
        this.socket = null;
        this.listener = net.createServer((socket) => {
            this.onNewConnection(socket);
        });

        if (port) {
            this.listener.listen(port, "127.0.0.1");
            this._log(`Listening on port ${port}`);
        } else if (namedSocket) {
            this.listener.listen(namedSocket);
            this._log(`Listening on named socket ${namedSocket}`);
        }
    }

    async onNewConnection(socket) {
        this._log("New connection");

        if (this.socket) {
            const closePromise = new Promise((resolve) =>
                this.once("connection_closed", resolve)
            );
            this._log("Have previous connection, ending that");
            this.socket.end();
            await closePromise;
        }

        this.socket = socket;

        this.socket.on("data", async (data) => {
            try {
                await this.handle(JSON.parse(data.toString()));
            } catch (error) {
                this._log(`Error: Couldn't handle socket data, ${error}`);
            }
        });

        this.socket.on("error", (error) => {
            this._log(`Error: From socket, ${error}`);
        });

        this.socket.on("close", () => {
            this._log("Connection closed");
            this.socket = null;
            this.emit("connection_closed");
        });
    }

    async handle(data) {
        if (data.type === "cmd") {
            await this.emit(data.action, data.data);
        }
    }

    dispose() {
        this.listener.close();

        if (this.socket) {
            this.socket.end();
        }
        this._log("We should be dead now");
    }

    async end() {
        if (this.socket) {
            this.socket.end();
        }
    }

    async _write(data) {
        if (!this.socket) {
            this._log(`Error: Connection closed, cannot write ${JSON.stringify(data)}`);

            return;
        }

        const strData = JSON.stringify(data);

        return new Promise((resolve) =>
            this.socket.write(`${strData}\n`, "utf8", resolve));
    }

    async error(msg, data = null) {
        await this._write({ type: "error", msg: msg, data: data });
    }

    async response(data = null) {
        await this._write({ type: "response", data: data });
    }

    async info(msg, data = null) {
        await this._write({ type: "msg", msg: msg, data: data });
    }

    async stdout(msg) {
        await this._write({ type: "stdout", msg: msg });
    }

    async stderr(msg) {
        await this._write({ type: "stderr", msg: msg });
    }

    async finish(result) {
        await this._write({ type: "finish", result: result });
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  SRV[${this.name}]  ${line}\n`);
    }
}

module.exports = { ScriptServer };
