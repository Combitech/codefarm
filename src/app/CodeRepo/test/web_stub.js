"use strict";

const router = require("koa-router")();
const Koa = require("koa2");
const singleton = require("singleton");

const PORT = 3000;
let ghs = null;

class WebStub {
    constructor() {
        this.unrouted = [];
        this.routed = [];
        this.accepted = [];
    }

    _route() {
        const accepted = ghs.instance.accepted;
        for (const a of accepted) {
            if (a.method === this.request.method && a.route === this.request.url) {
                this.result = a.code;
                this.body = a.response;
                ghs.instance.routed.push(this);

                return;
            }
        }

        ghs.instance.unrouted.push(this);
    }

    addAccepted(method, route, code, response) {
        this.accepted.push({ method, route, code, response });
    }

    clearReqs() {
        this.unrouted = [];
        this.routed = [];
    }

    getUnroutedReqs() {
        const unrouted = this.unrouted;
        this.unrouted = [];

        return unrouted;
    }

    getRoutedReqs() {
        const routed = this.routed;
        this.routed = [];

        return routed;
    }

    getLastRoutedReq() {
        return this.routed.pop();
    }

    start() {
        const app = new Koa();
        router.get(/^\/(.*)(?:\/|$)/, this._route);
        router.put(/^\/(.*)(?:\/|$)/, this._route);
        router.post(/^\/(.*)(?:\/|$)/, this._route);
        router.patch(/^\/(.*)(?:\/|$)/, this._route);
        router.delete(/^\/(.*)(?:\/|$)/, this._route);

        app.use(router.routes());

        this.server = app.listen(PORT);
        console.log(`listening on port ${PORT}`);
    }
}

ghs = singleton(WebStub);
/*
ghs.instance.addAccepted("GET", "/user/repos", 200, { result: "OK" });
ghs.instance.start();
*/

module.export = ghs;
