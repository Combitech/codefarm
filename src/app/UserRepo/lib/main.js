"use strict";

const os = require("os");
const Database = require("database");
const Web = require("web");
const { Service } = require("service");
const { ServiceComBus } = require("servicecom");
const Users = require("./controllers/users");
const Teams = require("./controllers/teams");
const UserAvatars = require("./controllers/user_avatars");
const TeamAvatars = require("./controllers/team_avatars");
const Policies = require("./controllers/policies");
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
    }

    async onOnline() {
        const routes = [].concat(Users.instance.routes, Teams.instance.routes, UserAvatars.instance.routes, TeamAvatars.instance.routes, Backends.instance.routes, Policies.instance.routes, this.routes);

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.bus.uri,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            Users.instance,
            Teams.instance,
            UserAvatars.instance,
            TeamAvatars.instance,
            Backends.instance,
            Policies.instance,
            this.statesControllerInstance
        ]);

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
