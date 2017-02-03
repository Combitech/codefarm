"use strict";

const { ServiceMgr } = require("service");
const log = require("log");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { AsyncEventEmitter } = require("emitter");

class GithubEventEmitter extends AsyncEventEmitter {
    constructor() {
        super();
    }

    async _setupWebServer(port) {
        const app = new Koa();

        app.use(bodyParser());

        app.use(async (ctx) => {
            const body = ctx.request.body;
            if (body && body.zen) {
                this.emit("ping", body);
            } else if (body && body.pull_request) {
                if (body.action && body.action === "opened") {
                    this.emit("pull-request-open", body);
                } else {
                    ServiceMgr.instance.log("verbose", "unknown pull-request event received");
                }
            } else {
                ServiceMgr.instance.log("verbose", "unknown event received");
                ServiceMgr.instance.log("debug", body);
            }

            ctx.response.status = 200;
        });

        this.server = app.listen(port);

        return new Promise((resolve, reject) => {
            this.server.on("listening", () => {
                this.server.removeListener("error", reject);
                resolve(`Webhook server up on port ${port}`);
            });
            this.server.once("error", reject);
        });
    }

    async teardownWebServer() {
        ServiceMgr.instance.log("verbose", "Tearing down web hook server");
        this.server.close();
    }

    async start(port) {
        return await this._setupWebServer(port);
    }

    async dispose() {
        await this.teardownWebServer();
        this.removeAllListeners();
    }
}

module.exports = GithubEventEmitter;
