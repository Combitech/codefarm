"use strict";

const log = require("log");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { AsyncEventEmitter } = require("emitter");

class GithubEventEmitter extends AsyncEventEmitter {
    constructor() {
        super();
    }

    async testEventStream() {
        // Should trigger a ping
    }

    async _setupWebServer(port) {
        this.app = new Koa();

        this.app.use(bodyParser());

        this.app.use(async (ctx) => {
            const body = ctx.request.body;
            if (body && body.zen) {
                this.emit("ping", body);
            } else if (body && body.pull_request) {
                if (body.action && body.action === "opened") {
                    this.emit("pull-request-open", body);
                } else {
                    console.log("unknown pull-request event received");
                }
            } else {
                console.log("unknown event received");
            }

            ctx.response.status = 200;
        });

        const server = this.app.listen(port);

        return new Promise((resolve, reject) => {
            server.on("listening", () => {
                server.removeListener("error", reject);
                resolve(`Webhook server up on port ${port}`);
            });
            server.once("error", reject);
        });
    }

    async teardownWebServer() {
        console.log("Tearing down web hook server");
        this.app.close();
    }

    async start(port) {
        await this._setupWebServer(port);
    }

    async dispose() {
        this.disposed = true;
        this.teardownWebServer();
        this.removeAllListeners();
    }
}

module.exports = GithubEventEmitter;
