"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const Users = require("./controllers/users");
const Teams = require("./controllers/teams");
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
        await this.need("db", "mgmt", Database, {
            name: this.name
        });
    }

    async onOnline() {
        const routes = Object.assign({}, Users.instance.routes, Teams.instance.routes, Backends.instance.routes, this.routes);

        await BackendProxy.instance.start(this.config.backends);
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
