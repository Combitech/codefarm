"use strict";

const { ServiceMgr } = require("service");
const Koa = require("koa2");
const bodyParser = require("koa-bodyparser");
const { synchronize } = require("misc");
const { AsyncEventEmitter } = require("emitter");

class GithubEventEmitter extends AsyncEventEmitter {
    constructor() {
        super();

        synchronize(this, "emit");
    }

    async _setupWebServer(port) {
        const app = new Koa();

        app.use(bodyParser());

        app.use(async (ctx) => {
            const header = ctx.request.header;
            const body = ctx.request.body;

            // We need a body with an action and a header with an event type
            if (body && header && header["x-github-event"]) {
                switch (header["x-github-event"]) {
                case "ping":
                    this.emit("ping", body);
                    break;

                case "pull_request":
                    switch (body.action) {
                    case "opened":
                        await this.emit("pull_request_opened", body);
                        break;
                    case "synchronize":
                        await this.emit("pull_request_updated", body);
                        break;
                    case "closed":
                        await this.emit("pull_request_closed", body);
                        break;

                    default:
                        ServiceMgr.instance.log("verbose", "unknown pull-request event received");
                        ServiceMgr.instance.log("verbose", JSON.stringify(body, null, 2));
                    }
                    break;

                case "push":
                    await this.emit("push", body);
                    break;

                case "pull_request_review":
                    await this.emit("pull_request_review", body);
                    break;

                default:
                    ServiceMgr.instance.log("verbose", `unknown event ${header["x-github-event"]} received`);
                    ServiceMgr.instance.log("verbose", JSON.stringify(body, null, 2));
                }
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
