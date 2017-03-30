"use strict";

const route = require("koa-route");
const Koa = require("koa2");
const { AsyncEventEmitter } = require("emitter");
const { Deferred } = require("misc");

class GitHubStub extends AsyncEventEmitter {
    constructor() {
        super();

        this.accepted = [];
        this.routed = [];
    }

    async _route(ctx) {
//        console.log(this);
//        console.log(ctx);
//        console.log("Request", ctx.request.method, ctx.request.url);
//        console.log("Emitting", ctx.request.method, ctx.request.url);

        await this.emit(ctx.request.method, ctx.request.url);

        const accepted = this.accepted;
        for (const a of accepted) {
            if (a.method === ctx.request.method && a.route === ctx.request.url) {
                ctx.response.result = a.code;
                ctx.response.body = a.response;
                this.routed.push({ method: a.method, route: a.route });

                return;
            }
        }

        ctx.response.result = 200;
        ctx.response.body = null;
    }

    // Expect a sequence of actions on URLs and resolve promise once all done
    expect(method, urls) {
        const deferred = new Deferred();
        this.addListener(method, async (url) => {
            if (urls.length === 0) {
                console.log(`Expected no more requests but got ${method} on ${url}`);
                deferred.reject();

                return;
            }

            if (urls[0] === url) {
                urls.shift();
            } else {
                console.log(`Expected ${method} on ${urls[0]} but got ${url}`);
                deferred.reject();

                return;
            }

            // Have all URLs been accessed?
            if (urls.length === 0) {
                deferred.resolve();
            }
        });

        return deferred;
    }

    getRouted() {
        return this.routed;
    }

    reset() {
        this.accepted = [];
        this.routed = [];
    }

    addRequestResponse(method, route, code, response) {
        this.accepted.push({ method, route, code, response });
    }

    start(port) {
        const app = new Koa();
        app.use(route.get("(.*)", async (ctx) => this._route(ctx)));
        app.use(route.post("(.*)", async (ctx) => this._route(ctx)));
        app.use(route.delete("(.*)", async (ctx) => this._route(ctx)));
        this.server = app.listen(port);
        console.log(`Github stub listening on port ${port}`);
    }
}

module.exports = GitHubStub;
