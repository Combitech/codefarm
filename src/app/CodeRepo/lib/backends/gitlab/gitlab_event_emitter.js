"use strict";

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { synchronize } = require("misc");
const { AsyncEventEmitter } = require("emitter");

class GitLabEventEmitter extends AsyncEventEmitter {
    constructor(log = false) {
        super();

        // Ignore logs if no log function set
        this.log = typeof log === "function" ? log : () => null;
        synchronize(this, "emit");
    }

    async _setupWebServer(port) {
        const app = new Koa();

        app.use(bodyParser());

        app.use(async (ctx) => {
            const header = ctx.request.header;
            const body = ctx.request.body;

            console.log(JSON.stringify(header, null, 2));
            console.log(JSON.stringify(body, null, 2));

            // We need a body with an action and a header with an event type
            if (body && header && header["x-gitlab-event"]) {
                switch (header["x-gitlab-event"]) {
                case "Push Hook":
                    await this.emit("push", body);
                    break;

                case "Merge Request Hook":
                    switch (body.object_attributes.action) {
                    case "opened":
                        await this.emit("merge_request_opened", body);
                        break;
                    case "update":
                        await this.emit("merge_request_updated", body);
                        break;
                    case "closed":
                        await this.emit("merge_request_closed", body);
                        break;

                    default:
                        await this.emit("merge_request_unknown", body);
                    }
                    break;

                default:
                    console.log("unknown event received", body);
                    await this.emit("unknown_event", { type: header["x-gitlab-event"], body: body });
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
                resolve(`GitLab webhook server up on port ${port}`);
            });
            this.server.once("error", reject);
        });
    }

    async teardownWebServer() {
        this.log("verbose", "Tearing down GitLab web hook server");
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

module.exports = GitLabEventEmitter;
