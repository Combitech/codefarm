"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const Repositories = require("./controllers/repositories");
const Logs = require("./controllers/logs");
const Log = require("./types/log");
const Backends = require("./controllers/backends");
const BackendProxy = require("./backend_proxy");
const { RawLogClient, LogClient } = require("loglib");

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
        const routes = [].concat(Logs.instance.routes, Repositories.instance.routes, Backends.instance.routes, this.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Logs.instance,
            Repositories.instance,
            Backends.instance,
            this.statesControllerInstance
        ]);

        await RawLogClient.instance.start(this.config.msgbus);
        this.addDisposable(RawLogClient.instance);

        await LogClient.instance.start(this.config.msgbus);
        this.addDisposable(LogClient.instance);

        await BackendProxy.instance.start(this.config.backends);
        this.addDisposable(BackendProxy.instance);

        RawLogClient.instance.subscribe(async (data) => {
            await Log.append(data._id, data.data);
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
