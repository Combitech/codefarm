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

            // We need a body with an action and a header with an event type
            if (body && header && header["X-Gitlab-Event"]) {
                switch (header["X-GitLab-Event"]) {
                default:
                    console.log(`GitLab event: ${body}`);
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
