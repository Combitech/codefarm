"use strict";

const os = require("os");
const Database = require("database");
const LogBus = require("logbus");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const RestClient = require("restclient");
const Slaves = require("./controllers/slaves");
const Jobs = require("./controllers/jobs");
const SubJobs = require("./controllers/sub_jobs");
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
        await this.need("logrepo", "logrepo", RestClient, this.config.logRepo);
        await this.need("lb", "mgmt", LogBus, this.config.logBus);
    }

    async onOnline() {
        await this.want("artifactrepo", "artifactrepo", RestClient, this.config.artifactRepo);
        await this.want("coderepo", "coderepo", RestClient, this.config.codeRepo);
        await this.want("exec", "exec", RestClient, this.config.exec);

        const routes = [].concat(Slaves.instance.routes, Jobs.instance.routes, SubJobs.instance.routes, this.routes);

        await ServiceComBus.instance.start({
            name: this.name,
            uri: this.config.msgbus
        });
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Slaves.instance,
            Jobs.instance,
            SubJobs.instance,
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
