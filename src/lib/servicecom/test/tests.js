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
            const msgbus = new MsgBus({
                testMode: true,
                routingKey: "myname"
            });

            msgbus.on("publish", async (message) => {
                await msgbus.emit("data", message);
            });

            ThingController.instance.setMb(msgbus);

            env.client = new MbClient("myname", msgbus);
        });

        testcases(env);

        after(async () => {
            await Database.dispose();
        });
    });
});
