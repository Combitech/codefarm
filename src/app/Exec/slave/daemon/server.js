"use strict";

const net = require("net");
const moment = require("moment");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");
const { OutStream } = require("./outstream");
const { InStream } = require("./instream");

class Server extends AsyncEventEmitter {
    constructor(name, logfile, port) {
        super();
        this.name = name;

        this.logfile = logfile;
        this.ended = false;
        this.socket = null;
        this.instream = new InStream(logfile);
        this.outstream = new OutStream(logfile);
        this.listener = net.createServer((socket) => {
            this.onNewConnection(socket);
        });

        this.instream.on("data", async (data) => {
            await this.handle(data);
        });

        this.instream.on("error", (error) => {
            this._log(`Error: From instream, ${error}`);
        });

        this.outstream.on("drain", async () => {
            this._log(`Got drain event, ended = ${this.ended}`);
            if (this.ended) {
                this.end();
            }
        });

        this.outstream.on("error", (error) => {
            this._log(`Error: From outstream, ${error}`);
        });

        this.listener.listen(port, "127.0.0.1");
        this._log(`Listening on port ${port}`);
    }

    async onNewConnection(socket) {
        this._log("New connection");

        if (this.socket) {
            this._log("Have previous connection, ending that");
            this.instream.unsetStream();
            this.socket.end();
        }

        this.socket = socket;

        this.socket.on("close", () => {
            this._log("Connection closed");
            this.socket = null;

            this.instream.unsetStream();
            this.outstream.unsetStream();
        });

        await this.instream.setStream(this.socket);
        await this.outstream.setStream(this.socket);
    }

    async handle(data) {
        if (data.type === "ack") {
            await this.outstream.ack(data.ack);
        } else if (data.type === "cmd") {
            await this.emit(data.action, data.data);
        }
    }

    end() {
        if (!this.ended) {
            this.ended = true;
            this._log("Ended flag set");
        }

        if (this.outstream.isEmpty()) {
            this._log("Buffer is empty");

            this.listener.close();

            if (this.socket) {
                this.socket.end();
            }

            this._log("We should be dead now");
        } else {
            this._log("Buffer is not empty");
        }
    }

    async _sendOut(type, content = {}) {
        const data = Object.assign(content, {
            type: type,
            time: moment().utc().format()
        });
        await this.outstream.write(data);
    }

    async error(msg, data = null) {
        await this._sendOut("error", { msg: msg, data: data });
    }

    async info(msg, data = null) {
        await this._sendOut("msg", { msg: msg, data: data });
    }

    async stdout(msg) {
        await this._sendOut("stdout", { msg: msg });
    }

    async stderr(msg) {
        await this._sendOut("stderr", { msg: msg });
    }

    async finish(result) {
        await this._sendOut("finish", { result: result });
    }

    async executing() {
        await this._sendOut("executing", {});
    }

    async typeRead(typeName, id, getter) {
        await this._sendOut("type_read", { typeName: typeName, id: id, getter: getter });
    }

    async typeCreate(typeName, data = null) {
        await this._sendOut("type_create", { typeName: typeName, data: data });
    }

    async typeUpdate(typeName, id, data = null) {
        await this._sendOut("type_update", { typeName: typeName, id: id, data: data });
    }

    async typeAction(typeName, id, action, data = null) {
        await this._sendOut("type_action", { typeName: typeName, id: id, action: action, data: data });
    }

    async fileUpload(kind, data = null) {
        await this._sendOut("file_upload", { kind: kind, data: data });
    }

    async revisionMerge(revisionId, data = null) {
        await this._sendOut("revision_merge", { revisionId: revisionId, data: data });
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  SRV[${this.name}]  ${line}\n`);
    }
}

module.exports = { Server };
