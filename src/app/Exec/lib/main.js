"use strict";

const os = require("os");
const Database = require("database");
const { RawLogClient } = require("loglib");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus, HttpClient } = require("servicecom");
const Slaves = require("./controllers/slaves");
const Jobs = require("./controllers/jobs");
const SubJobs = require("./controllers/sub_jobs");
const Control = require("./control");
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

        await this.need("db", "mgmt", Database, this.config.db);

        // Need HttpClient to upload files
        await this.need("logrepo", "logrepo", HttpClient, this.config.logRepo);
        await this.need("artifactrepo", "artifactrepo", HttpClient, this.config.artifactRepo);
    }

    async onOnline() {
        const routes = [].concat(Slaves.instance.routes, Backends.instance.routes, Jobs.instance.routes, SubJobs.instance.routes, this.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Slaves.instance,
            Jobs.instance,
            SubJobs.instance,
            Backends.instance,
            this.statesControllerInstance
        ]);

        await RawLogClient.instance.start(Object.assign({
            uri: this.config.msgbus
        }, this.config.loglib));
        this.addDisposable(RawLogClient.instance);

        await Control.instance.start();
        this.addDisposable(Control.instance);

        await BackendProxy.instance.start(this.config.backends, this.config.backendsConfig);
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
