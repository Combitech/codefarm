"use strict";

/* global describe it before after */

const { assert } = require("chai");
const getPort = require("get-port");
const Web = require("web");
const MsgBus = require("msgbus");
const Database = require("./lib/database");
const ThingController = require("./lib/thing_controller");
const HttpClient = require("../lib/http_client");
const MbClient = require("../lib/mb_client");
const ServiceComBus = require("../lib/bus")
const testcases = require("./testcases");

describe("Tests", () => {
    describe("HTTP", () => {
        const env = {};

        before(async () => {
            const opts = {
                port: await getPort()
            };

            await Web.instance.start(opts, ThingController.instance.routes);

            env.client = new HttpClient({
                url: `http://localhost:${opts.port}`
            });
        });

        testcases(env);

        after(async () => {
            await Database.dispose();
            await Web.instance.dispose();
        });
    });

    describe("MB", () => {
        const env = {};

        before(async () => {
            const scb = new ServiceComBus({
                testMode: true
            }, { serviceName: "myname" });

            scb.on("publish", async (message) => {
                await scb.emit("data", message);
            });

            ThingController.instance.setMb(scb);

            env.client = new MbClient("myname", scb);
        });

        testcases(env);

        after(async () => {
            await Database.dispose();
        });
    });
});
