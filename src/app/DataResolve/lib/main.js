"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
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
        const routes = [].concat(this.routes, Datas.instance.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus
        }, this.config.servicecom));
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
