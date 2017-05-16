"use strict";

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { synchronize } = require("misc");
const { AsyncEventEmitter } = require("emitter");
const crypto = require("crypto");

class GithubEventEmitter extends AsyncEventEmitter {
    constructor(log = false) {
        super();

        // Ignore logs if no log function set
        this.log = typeof log === "function" ? log : () => null;
        synchronize(this, "emit");
    }

    async _setupWebServer(port, webhookSecret) {
        const app = new Koa();

        app.use(bodyParser());

        app.use(async (ctx) => {
            const header = ctx.request.header;
            const body = ctx.request.body;

            // Verify contents if secret set
            if (webhookSecret) {
                const hash = crypto.createHmac("sha1", webhookSecret).update(body).digest("hex");
                if (!header["X-Hub-Signature"] || header["X-Hub-Signature"] !== hash) {
                    throw Error("Missing or incorrect signature in GitHub event");
                }
            }

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
                        await this.emit("pull_request_unknown", body);
                    }
                    break;

                case "push":
                    await this.emit("push", body);
                    break;

                case "pull_request_review":
                    await this.emit("pull_request_review", body);
                    break;

                default:
                    await this.emit("unknown_event", { type: header["x-github-event"], body: body });
                }
            } else {
                await this.emit("malformed_event", { header: header, body: body });
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
        this.log("verbose", "Tearing down web hook server");
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
