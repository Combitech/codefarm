"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const RestClient = require("restclient");
const Datas = require("./controllers/datas");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const RefResolver = require("./resolvers/ref_resolver");
const BaselineFlowsResolver = require("./resolvers/baseline_flows_resolver");
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
    }

    async onOnline() {
        // Add dependencies to all services without restart when they go offline
        const secondaryRestNeeds = [
            "mgmt", "exec", "baselinegen", "flowctrl", "coderepo", "userrepo", "artifactrepo", "logrepo", "eventrepo"
        ];
        for (const serviceId of secondaryRestNeeds) {
            await this.want(serviceId, serviceId, RestClient);
        }

        const routes = [].concat(this.routes, Datas.instance.routes);

        await ServiceComBus.instance.start({
            name: this.name,
            uri: this.config.msgbus
        });
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Datas.instance,
            this.statesControllerInstance
        ]);

        await RefResolver.instance.start(this.config.resolver);
        this.addDisposable(RefResolver.instance);

        await BaselineFlowsResolver.instance.start(this.config.resolver);
        this.addDisposable(BaselineFlowsResolver.instance);

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
