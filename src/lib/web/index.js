"use strict";

const Koa = require("koa");
const send = require("koa-send");
const auth = require("koa-basic-auth");
const koaJwt = require("koa-jwt");
const cookie = require("cookie");
const route = require("koa-route");
const bodyParser = require("koa-bodyparser");
const compress = require("koa-compress");
const conditional = require("koa-conditional-get");
const etag = require("koa-etag");
const serve = require("koa-static");
const { AsyncEventEmitter } = require("emitter");
const { ensureArray } = require("misc");
const singleton = require("singleton");
const log = require("log");
const { Token } = require("auth");

class Web extends AsyncEventEmitter {
    constructor() {
        super();

        this.app = null;
        this.server = null;
    }

    async start(params, routes, statusRouteName = "/status") {
        this.app = new Koa();

        this.app.use(compress());
        this.app.use(bodyParser({ enableTypes: [ "json", "form", "text" ] }));
        this.app.use(conditional());
        this.app.use(etag());

        this.app.use(async (ctx, next) => {
            try {
                await next();
            } catch (error) {
                if (error.status === 401) {
                    ctx.set("WWW-Authenticate", "Basic");
                }

                ctx.status = error.status || 500;
                ctx.type = "json";
                ctx.body = JSON.stringify({
                    result: "fail",
                    error: error.message || error,
                    status: ctx.status
                }, null, 2);
            }
        });

        if (params.auth) {
            if (params.auth.name && params.auth.pass) {
                this.app.use(auth(params.auth));
            }
            if (params.auth.jwtPublicKey) {
                Token.instance.setKeys({
                    public: params.auth.jwtPublicKey
                });
                this.app.use(koaJwt({
                    secret: params.auth.jwtPublicKey,
                    cookie: params.auth.jwtCookieName,
                    // Set ctx.state.user if authenticated
                    passthrough: true
                }));
            }
        }

        const staticPaths = ensureArray(params.serveStatic);

        for (const staticPath of staticPaths) {
            this.app.use(serve(staticPath));
        }

        const apiDocRows = [];

        if (routes.constructor === Array) {
            for (const r of routes) {
                this.app.use(route[r.method || "get"](r.route, r.handler));

                apiDocRows.push({
                    "method": r.method || "get",
                    "route": r.route,
                    "description": r.description || ""
                });
            }
        } else {
            for (const name of Object.keys(routes)) {
                if (name === "unamed") {
                    for (const fn of routes.unamed()) {
                        this.app.use(fn);
                    }
                } else {
                    let method = "get";
                    let routeName = name;

                    if (name[0] !== "/") {
                        [ , method, routeName ] = name.match(/(.+?)(\/.*)/);
                    }

                    this.app.use(route[method](routeName, routes[name]));
                    apiDocRows.push({
                        "method": method,
                        "route": routeName,
                        "description": ""
                    });
                }
            }
        }

        // Route for showing web server status including the exposed API
        this.app.use(route.get(statusRouteName, async (ctx) => {
            const rows = apiDocRows.map((item) =>
                `<tr>
                    <td>${item.method}</td>
                    <td>${item.route}</td>
                    <td>${item.description}</td>
                <tr>`).join("\n");

            const body = `
            <html>
                <head></head>
                <body>
                    <h1>Status</h1>
                    <h2>API</h2>
                    <table>
                        <tr>
                            <th>Method</th>
                            <th>Route</th>
                            <th>Description</th>
                        </tr>
                        ${rows}
                    </table>
                </body>
            </html>`;

            ctx.type = "html";
            ctx.body = body;
        }));

        if (params.webpackMiddleware) {
            this.app.use(params.webpackMiddleware);
        }

        if (staticPaths.length > 0) {
            this.app.use(route.get("*", async (ctx) => await send(ctx, "/index.html", { root: staticPaths[0] })));
        }

        this.server = this.app.listen(params.port);

        if (params.api) {
            this.api = params.api;
            await this.api.start(this.server, {
                authHandler: this._apiJwtAuthHandler.bind(this, params.auth)
            });

            this.api.on("connection", (client) => {
                for (const Api of params.Apis) {
                    if (Api.instance.clientConnected) {
                        Api.instance.clientConnected(client);
                    }
                }
            });

            this.api.on("disconnection", (client) => {
                for (const Api of params.Apis) {
                    if (Api.instance.clientDisconnected) {
                        Api.instance.clientDisconnected(client);
                    }
                }
            });
        }

        await this.emit("start", { port: params.port });
        log.info(`HTTP server started, listening on port ${params.port}`);
    }

    /** Checks api.io request for cookie containing the JWT token and decodes
     * and verifies the token if found. The decoded result is stored in
     * session.user
     * @param {Object} authParams Authorization parameters
     * @param {Object} authParams.jwtCookieName Authorization parameters
     * @param {Object} authParams.jwtSecret Authorization parameters
     * @param {Object} request Sets request.session.user to decoded token
     *   if token in jwtCookieName is decoded successfully.
     * @return {Promise} Resolved when done
     */
    async _apiJwtAuthHandler(authParams, request) {
        if (!authParams || !authParams.jwtPublicKey || !authParams.jwtCookieName) {
            return false;
        }
        const cookieName = authParams.jwtCookieName;
        request.session.user = {};
        const cookies = request.headers.cookie;
        if (cookies && cookies.indexOf(cookieName) !== -1) {
            let token;
            try {
                token = cookie.parse(cookies)[cookieName];
            } catch (e) {
            }
            if (token) {
                try {
                    const decodedToken = await Token.instance.verifyToken(token);
                    request.session.user.token = token;
                    request.session.user.tokenData = decodedToken;
                } catch (error) {
                    // Failed to verify JWT token, log and proceed without setting request.session
                    log.verbose(`web: Failed to decode JWT token in cookie ${cookieName}`);
                }
            }
        }
    }

    async dispose() {
        if (this.api) {
            await this.api.stop();
            this.api = null;
        }
        if (this.server) {
            this.server.close();
        }

        this.server = null;
        this.app = null;

        await this.emit("dispose");

        this.removeAllListeners();
    }
}

module.exports = singleton(Web);
