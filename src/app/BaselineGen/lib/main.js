"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const Specifications = require("./controllers/specifications");
const Collectors = require("./controllers/collectors");
const Baselines = require("./controllers/baselines");
const Control = require("./control");

class Main extends Service {
    constructor(name, version) {
        super(name, version);
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.web.port}`
        });

        await this.need("db", "mgmt", Database, Object.assign({ name: this.name }, this.config.db));
    }

    async onOnline() {
        const routes = [].concat(Specifications.instance.routes, Collectors.instance.routes, Baselines.instance.routes, this.routes);

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
