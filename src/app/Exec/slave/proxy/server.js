"use strict";

const readline = require("readline");
const fs = require("fs-extra-promise");
const { AsyncEventEmitter } = require("emitter");

class Server extends AsyncEventEmitter {
    constructor(logfile) {
        super();

        this.logfile = logfile;

        this.rl = readline.createInterface({
            input: process.stdin,
            terminal: false
        });

        this.rl.on("line", (line) => {
            this._log(`Data from server: ${line}`);
            this.emit("data", `${line}\n`); // TODO: Why do we need \n here?
        });

        this.rl.on("close", () => {
            this.rl = null;
            this._log("Got close on stdin");
            this.emit("close");
        });
    }

    write(data) {
        if (this.rl) {
            console.log(data);
        } else {
            this._log(`Got write with nowhere to write: ${data}`);
        }
    }

    _write(data) {
        this.write(JSON.stringify(data));
    }

    status(status, msg) {
        this._write({ type: "status", status: status, msg: msg });
    }

    ready(online, port, msg) {
        this._write({ type: "ready", online: online, port: port, msg: msg });
    }

    end() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }

    _log(line) {
        fs.appendFileSync(this.logfile, `${new Date()}  SRV  ${line}\n`);
    }
}

module.exports = { Server };
