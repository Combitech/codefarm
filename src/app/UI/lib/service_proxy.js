"use strict";

const proxy = require("koa-proxies");
const { ServiceMgr } = require("service");
const singleton = require("singleton");
const { isTokenValidForAccess } = require("auth");

class ServiceProxy {
    constructor() {
        this.routes = [];
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

    addProxyRoute(method, requiredAccess, type, getter) {
        const [ service, typeName ] = type.split(".");
        const baseRoute = `/${service}/${typeName}`;
        let route = `${baseRoute}/:id`;
        if (getter) {
            route = `${route}/${getter}`;
        }
        const routeHandler = async (ctx, id) => {
            const decodedToken = ctx.state && ctx.state.user;
            isTokenValidForAccess(decodedToken, type, requiredAccess);
            const serviceUrl = await this._getServiceUrl(service);
            const targetBasePath = `/${typeName}`;
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

module.exports = singleton(ServiceProxy);
