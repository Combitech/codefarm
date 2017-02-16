"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const Repositories = require("./controllers/repositories");
const Revisions = require("./controllers/revisions");
const Backends = require("./controllers/backends");
const BackendProxy = require("./backend_proxy");
const Repository = require("./types/repository");
const Revision = require("./types/revision");

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
        const routes = [].concat(Repositories.instance.routes, Revisions.instance.routes, Backends.instance.routes, this.routes);

        await ServiceComBus.instance.start({
            name: this.name,
            uri: this.config.msgbus
        });
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Repositories.instance,
            Revisions.instance,
            Backends.instance,
            this.statesControllerInstance
        ]);

        await BackendProxy.instance.start(this.config.backends, Repository, Revision);
        this.addDisposable(BackendProxy.instance);

        await Web.instance.start(this.config.web, routes);
        this.addDisposable(Web.instance);

        this.log("info", "I'm online!");
    }

    async onOffline() {
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
