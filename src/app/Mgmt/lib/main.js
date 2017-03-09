"use strict";

const os = require("os");
const fs = require("fs-extra-promise");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const Monitor = require("./monitor");
const Configs = require("./controllers/configs");
const Config = require("./types/config");
const ServiceCtrl = require("./controllers/services");
const Db = require("./db");
const { notification } = require("typelib");

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
        await this.provide("LogBus", {
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

        if (this.config.jwtprivate && this.config.jwtpublic) {
            const keys = {
                private: await fs.readFileAsync(this.config.jwtprivate, "utf8"),
                public: await fs.readFileAsync(this.config.jwtpublic, "utf8")
            };
            ServiceCtrl.instance.setKeys(keys);
            Config.setGlobalOpts({ publicKey: keys.public });
        }
        this.addDisposable(Configs.instance);

        const routes = [].concat(Configs.instance.routes, ServiceCtrl.instance.routes, this.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Configs.instance,
            ServiceCtrl.instance,
            this.statesControllerInstance
        ]);

        notification.on("config.tagged", Configs.instance.onTagged.bind(Configs.instance));

        await Monitor.instance.start();
        this.mgr.addMgmtBusListener(Monitor.instance.mgmtBusListener.bind(Monitor.instance));
        this.addDisposable(Monitor.instance);

        const webOpts = { port: this.config.port };
        await Web.instance.start(webOpts, routes);
        this.addDisposable(Web.instance);

        this.log("info", "I'm online!");
    }

    async onOffline() {
        notification.removeAllListeners("config.tagged");
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
