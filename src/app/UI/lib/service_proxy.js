"use strict";

const { ServiceMgr } = require("service");
const proxy = require("koa-proxies");

let instance;

class ServiceProxy {
    constructor() {
        this.routes = [];
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    _addRoute(method, route, handler, description = "") {
        this.routes.push({
            method: method,
            route: route,
            handler: handler.bind(this),
            description: description
        });
    }

    async _getServiceUrl(service) {
        const restClient = await ServiceMgr.instance.use(service);

        return restClient.url;
    }

    addProxyRoute(method, service, type, getter) {
        const baseRoute = `/${service}/${type}`;
        let route = `${baseRoute}/:id`;
        if (getter) {
            route = `${route}/${getter}`;
        }
        const routeHandler = async (ctx, id) => {
            const serviceUrl = await this._getServiceUrl(service);
            const targetBasePath = `/${type}`;
            let targetPath = `${targetBasePath}/${id}`;

            if (getter) {
                targetPath = `${targetPath}/${getter}`;
            }

            ServiceMgr.instance.log("verbose", `Proxy request to ${serviceUrl}${targetPath}`);

            await proxy(baseRoute, {
                target: serviceUrl,
                rewrite: (path) => path.replace(baseRoute, targetBasePath)
            })(ctx, Promise.resolve());
        };

        this._addRoute(method, route, routeHandler);
    }

    async start() {
    }

    async dispose() {
    }
}

module.exports = ServiceProxy;
