"use strict";

const os = require("os");
const path = require("path");
const Database = require("database");
const { RawLogClient } = require("loglib");
const { flattenArray } = require("misc");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus, HttpClient } = require("servicecom");
const Slaves = require("./controllers/slaves");
const Jobs = require("./controllers/jobs");
const SubJobs = require("./controllers/sub_jobs");
const JobSpecs = require("./controllers/jobspecs");
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
        const controllerInstances = [
            Slaves.instance,
            Jobs.instance,
            SubJobs.instance,
            JobSpecs.instance,
            Backends.instance,
            this.statesControllerInstance
        ];
        const routes = flattenArray(
            controllerInstances.map((controller) => controller.routes)
        );

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.bus.uri,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers(controllerInstances);

        await RawLogClient.instance.start(Object.assign({
            uri: this.config.bus.uri,
            synchronized: false
        }, this.config.loglib));
        this.addDisposable(RawLogClient.instance);

        const backendConfig = Object.assign({
            searchPaths: [
                path.join(__dirname, "backends"),
                ...this.config.backendSearchPath
            ]
        }, this.config.backends);
        await BackendProxy.instance.start(backendConfig, this.config.backendsConfig);
        this.addDisposable(BackendProxy.instance);

        await Control.instance.start();
        this.addDisposable(Control.instance);

        await Web.instance.start(this.config.web, routes);
        this.addDisposable(Web.instance);

        this.log("info", "I'm online!");
    }

    async onOffline() {
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
