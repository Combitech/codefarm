"use strict";

const os = require("os");
const path = require("path");
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

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.bus.uri,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Repositories.instance,
            Revisions.instance,
            Backends.instance,
            this.statesControllerInstance
        ]);

        const backendConfig = Object.assign({
            searchPaths: [
                path.join(__dirname, "backends"),
                ...this.config.backendSearchPath
            ]
        }, this.config.backends);
        await BackendProxy.instance.start(backendConfig, Repository, Revision, this.config.backendsConfig);
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
