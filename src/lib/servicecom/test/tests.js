"use strict";

/* global describe before after */

const getPort = require("get-port");
const Web = require("web");
const Database = require("./lib/database");
const ThingController = require("./lib/thing_controller");
const HttpClient = require("../lib/http_client");
const ServiceComBus = require("../lib/bus");
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
                uri: `http://localhost:${opts.port}`
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
            ServiceComBus.instance.start({
                uri: "dummy",
                name: "myname",
                testMode: true
            });

            ServiceComBus.instance.attachControllers([ ThingController.instance ]);

            env.client = ServiceComBus.instance.getClient("myname");
        });

        testcases(env);

        after(async () => {
            await ServiceComBus.instance.dispose();
            await Database.dispose();
        });
    });
});
