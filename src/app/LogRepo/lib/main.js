"use strict";

const os = require("os");
const Database = require("database");
const LogBus = require("logbus");
const Web = require("web");
const { Service } = require("service");
const Repositories = require("./controllers/repositories");
const Logs = require("./controllers/logs");
const Log = require("./types/log");
const Backends = require("./controllers/backends");
const BackendProxy = require("./backend_proxy");

class Main extends Service {
    constructor(name, version) {
        super(name, version);
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.web.port}`
        });
        await this.need("db", "mgmt", Database, Object.assign({ name: this.name }, this.config.db));
        await this.need("lb", "mgmt", LogBus, Object.assign({ queue: true, name: this.name }, this.config.lb));
    }

    async onOnline() {
        const routes = Object.assign({}, Logs.instance.routes, Repositories.instance.routes, Backends.instance.routes, this.routes);

        await BackendProxy.instance.start(this.config.backends);
        this.addDisposable(BackendProxy.instance);

        const lb = await this.use("lb");
        lb.on("data", async (data) => {
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
