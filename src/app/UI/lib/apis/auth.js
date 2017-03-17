"use strict";

const api = require("api.io");
const singleton = require("singleton");
const AuthMgr = require("../managers/auth");

const authApiExports = api.register("auth", {
    _login: async (session, emailOrId, password, opts) => {
        let result;
        try {
            result = await AuthMgr.instance.login(emailOrId, password, opts);
            if (result.success) {
                // Ask client to add cookie...
                Object.assign(result, {
                    setCookies: [ {
                        name: AuthMgr.instance.cookieName,
                        value: result.token,
                        opts: {
                            path: "/"
                        }
                    } ]
                });

                // Set user access token
                session.user = {
                    token: result.token,
                    tokenData: result.tokenData
                };

                result.user = result.tokenData;
            }
        } catch (error) {
            // Remove user access token
            session.user = {};

            result = {
                success: false,
                message: error.message
            };
        }

        return result;
    },
    login: api.export(async (session, emailOrId, password) =>
        authApiExports._login(session, emailOrId, password)
    ),
    logout: api.export(async (session) => {
        let result = {
            success: false,
            message: "Not logged in"
        };
        if (session.user && Object.keys(session.user).length > 0) {
            result = {
                success: true,
                user: session.user.tokenData,
                // Ask client to remove cookie...
                setCookies: [ {
                    name: AuthMgr.instance.cookieName,
                    value: "",
                    opts: {
                        path: "/"
                    }
                } ]
            };

            // Remove user access token
            session.user = {};
        }

        return result;
    }),
    whoami: api.export(async (session) => {
        let result = {
            success: false,
            message: "Not logged in"
        };
        if (session.user && Object.keys(session.user).length > 0) {
            result = {
                success: true,
                user: session.user.tokenData
            };
        } else {
            // No previous session, login as guest user
            // TODO: Move guest user id and password to config
            result = await authApiExports._login(session, "guest", "guestguest", {
                isGuestUser: true
            });
            if (result.success) {
                result.user.isGuestUser = true;
            }
        }

        return result;
    })
});

class AuthApi {
    constructor() {
        this.exports = authApiExports;
    }

    async start() {
    }

    async dispose() {
    }
}

module.exports = singleton(AuthApi);
