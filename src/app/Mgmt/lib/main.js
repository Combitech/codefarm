"use strict";

const os = require("os");
const Web = require("web");
const { Service } = require("service");
const Monitor = require("./monitor");
const Configs = require("./controllers/configs");
const Config = require("./types/config");
const Db = require("./db");
const { notification: typeNotify } = require("typelib");

class Main extends Service {
    constructor(name, version) {
        super(name, version);
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.port}`
        });
        await this.provide("MongoDB", {
            uri: this.config.mongo
        });
        await this.provide("MsgBus", {
            uri: this.config.msgbus
        });
        // Push msgBus dependency to get rid of circular require dependency
        Config.setMb(this.mgr.msgBus);
    }

    async onOnline() {
        const dbConfig = {
            uri: this.config.mongo,
            name: this.name
        };
        await Db.instance.connect(dbConfig);
        this.addDisposable(Db.instance);

        const routes = Object.assign({}, Configs.instance.routes, this.routes);

        typeNotify.on("config.tagged", Configs.instance.onTagged.bind(Configs.instance));

        await Monitor.instance.start();
        this.mgr.addMgmtBusListener(Monitor.instance.mgmtBusListener.bind(Monitor.instance));
        this.addDisposable(Monitor.instance);

        const webOpts = { port: this.config.port };
        await Web.instance.start(webOpts, routes);
        this.addDisposable(Web.instance);

        this.log("info", "I'm online!");
    }

    async onOffline() {
        typeNotify.removeAllListeners("config.tagged");
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
