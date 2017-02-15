"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const RestClient = require("restclient");
const Flows = require("./controllers/flows");
const Steps = require("./controllers/steps");
const Control = require("./control");

class Main extends Service {
    constructor(name, version) {
        super(name, version);
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.web.port}`
        });

        await this.need("db", "mgmt", Database, this.config.db);
        await this.need("baselinegen", "baselinegen", RestClient);
        await this.need("exec", "exec", RestClient);
        await this.need("coderepo", "coderepo", RestClient);
        await this.need("artifactrepo", "artifactrepo", RestClient);
    }

    async onOnline() {
        const routes = [].concat(Flows.instance.routes, Steps.instance.routes, this.routes);

        await ServiceComBus.instance.start({
            name: this.name,
            uri: this.config.msgbus
        });
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Flows.instance,
            Steps.instance,
            this.statesControllerInstance
        ]);
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
