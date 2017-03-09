"use strict";

const os = require("os");
const { join } = require("path");
const clone = require("clone");
const api = require("api.io");
const Web = require("web");
const { ServiceComBus, HttpClient } = require("servicecom");
const { Service } = require("service");
const MgmtMgr = require("./managers/mgmt");
const AuthMgr = require("./managers/auth");
const ServiceProxy = require("./service_proxy");

const Apis = [
    require("./apis/auth"),
    require("./apis/rest"),
    require("./apis/type")
];

class Main extends Service {
    constructor(name, version) {
        super(name, version);
        this.productionMode = process.env.NODE_ENV === "production";
    }

    async onSetup() {
        await this.provide("REST", {
            uri: `http://${os.hostname()}:${this.config.web.port}`
        });
    }

    async onOnline() {
        const webConfig = clone(this.config.web);

        // Add dependencies to all services without restart when they go offline
        // Needed for the service proxy
        const secondaryRestNeeds = [
            "mgmt", "ui", "exec", "baselinegen", "flowctrl", "coderepo", "userrepo", "artifactrepo", "logrepo", "eventrepo", "dataresolve"
        ];

        for (const serviceId of secondaryRestNeeds) {
            await this.want(serviceId, serviceId, HttpClient);
        }

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.msgbus
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            this.statesControllerInstance
        ]);

        await MgmtMgr.instance.start();
        this.addDisposable(MgmtMgr.instance);
        this.mgr.addMgmtBusListener(MgmtMgr.instance.getServiceMonitorBusListener());

        const mb = this.msgBus;
        mb.addListener("data", MgmtMgr.instance.getEventMonitorBusListener());

        await AuthMgr.instance.start(this.config);
        this.addDisposable(AuthMgr.instance);

        await ServiceProxy.instance.start();
        this.addDisposable(ServiceProxy.instance);
        ServiceProxy.instance.addProxyRoute("get", "userrepo", "useravatar", "avatar");
        ServiceProxy.instance.addProxyRoute("get", "userrepo", "teamavatar", "avatar");
        ServiceProxy.instance.addProxyRoute("get", "logrepo", "log", "download");

        for (const Api of Apis) {
            await Api.instance.start();
            this.addDisposable(Api.instance);
        }

        webConfig.serveStatic = [
            join(__dirname, "..", "client", "static"),
            join(__dirname, "..", "node_modules", "cheser-icon-theme")
        ];

        if (!this.productionMode) {
            const buildWebpackCfg = require("../client/webpack.config.js");
            const webpack = require("webpack");
            const webpackMiddleware = require("koa-webpack-dev-middleware");

            const webpackCfg = buildWebpackCfg({ dev: true });
            webConfig.webpackMiddleware = webpackMiddleware(
                webpack(webpackCfg), {
                    log: this.log.bind(this, "info"),
                    warn: this.log.bind(this, "warn"),
                    stats: true
                }
            );
        }

        webConfig.api = api;

        const routes = [].concat(this.routes, ServiceProxy.instance.routes, AuthMgr.instance.routes);

        webConfig.auth = webConfig.auth || {};
        webConfig.auth.jwtPublicKey = this.config.publicKey;

        await Web.instance.start(webConfig, routes);
        this.addDisposable(Web.instance);

        const modeStr = this.productionMode ? "production" : "development";
        this.log("info", `I'm online in ${modeStr} mode`);
    }

    async onOffline() {
        this.log("info", "I'm offline!");
    }
}

module.exports = Main;
