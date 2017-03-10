"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const Events = require("./controllers/events");
const Event = require("./types/event");

/** Do not store the following events */
const IGNORED_EVENTS = [ "snapshot" ];

class Main extends Service {
    constructor(name, version) {
        super(name, version);
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.web.port}`
        });

        await this.need("db", "mgmt", Database, this.config.db);
    }

    async onOnline() {
        const routes = [].concat(Events.instance.routes, this.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Events.instance,
            this.statesControllerInstance
        ]);

        this.msgBus.on("data", async (data) => {
            if (IGNORED_EVENTS.indexOf(data.event) === -1) {
                this.log("info", "Saving event ", JSON.stringify(data, null, 2));

                const event = new Event({
                    _id: data._id,
                    content: data,
                    time: new Date(data.time)
                });

                await event.save();
            }
        });

        await Web.instance.start(this.config.web, routes);
        this.addDisposable(Web.instance);

        this.log("info", "I'm online!");
    }

    async onOffline() {
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
