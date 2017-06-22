"use strict";

const os = require("os");
const { join } = require("path");
const clone = require("clone");
const api = require("api.io");
const Web = require("web");
const { ServiceComBus, HttpClient } = require("servicecom");
const { LogClient } = require("loglib");
const { Service } = require("service");
const MgmtMgr = require("./managers/mgmt");
const AuthMgr = require("./managers/auth");
const ServiceProxy = require("./service_proxy");
const { findDirsWithEntry } = require("backend");

const Apis = [
    require("./apis/auth"),
    require("./apis/rest"),
    require("./apis/type"),
    require("./apis/log"),
    require("./apis/info")
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
            "mgmt", "ui", "exec", "baselinegen", "flowctrl", "coderepo", "userrepo", "artifactrepo", "logrepo", "eventrepo", "dataresolve", "metadata"
        ];

        for (const serviceId of secondaryRestNeeds) {
            await this.want(serviceId, serviceId, HttpClient);
        }

        await ServiceComBus.instance.start(Object.assign({
            name: this.name,
            uri: this.config.bus.uri,
            publicKey: this.config.publicKey,
            token: this.config.token
        }, this.config.servicecom));
        this.addDisposable(ServiceComBus.instance);
        ServiceComBus.instance.attachControllers([
            this.statesControllerInstance
        ]);

        await LogClient.instance.start(Object.assign({
            uri: this.config.bus.uri
        }, this.config.loglib));
        this.addDisposable(LogClient.instance);

        await MgmtMgr.instance.start();
        this.addDisposable(MgmtMgr.instance);
        this.mgr.addMgmtBusListener(MgmtMgr.instance.getServiceMonitorBusListener());

        const mb = this.msgBus;
        mb.addListener("data", MgmtMgr.instance.getEventMonitorBusListener());

        await AuthMgr.instance.start(this.config);
        this.addDisposable(AuthMgr.instance);

        await ServiceProxy.instance.start();
        this.addDisposable(ServiceProxy.instance);
        ServiceProxy.instance.addProxyRoute("get", "read", "userrepo.useravatar", "avatar");
        ServiceProxy.instance.addProxyRoute("get", "read", "userrepo.teamavatar", "avatar");
        ServiceProxy.instance.addProxyRoute("post", "upload", "userrepo.useravatar", "upload");
        ServiceProxy.instance.addProxyRoute("post", "upload", "userrepo.teamavatar", "upload");
        ServiceProxy.instance.addProxyRoute("get", "read", "logrepo.log", "download");
        ServiceProxy.instance.addProxyRoute("get", "read", "artifactrepo.artifact", "download");

        for (const Api of Apis) {
            await Api.instance.start(this.config, this.name, this.version);
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

            const plugins = [];
            for (const searchPath of this.config.pluginSearchPath) {
                const entries = await findDirsWithEntry(searchPath);
                plugins.push(...entries);
            }
            const webpackCfg = buildWebpackCfg({
                dev: true,
                plugin: plugins.map((p) => p.path)
            });
            webConfig.webpackMiddleware = webpackMiddleware(
                webpack(webpackCfg), {
                    log: this.log.bind(this, "info"),
                    warn: this.log.bind(this, "warn"),
                    stats: true
                }
            );
        }

        webConfig.api = api;
        webConfig.Apis = Apis;

        const routes = [].concat(this.routes, ServiceProxy.instance.routes);

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
