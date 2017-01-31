"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const RestClient = require("restclient");
const Datas = require("./controllers/datas");
const { Service } = require("service");
const Resolver = require("./resolver");
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

        const routes = Object.assign({}, this.routes, Datas.instance.routes);

        await Resolver.instance.start(this.config.resolver);
        this.addDisposable(Resolver.instance);

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
