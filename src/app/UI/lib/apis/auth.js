"use strict";

const api = require("api.io");
const singleton = require("singleton");
const AuthMgr = require("../managers/auth");

const authApiExports = api.register("auth", {
    login: api.export(async (session, email, password) => {
        let result;
        try {
            const decodedTokenResultKey = "decodedKey";
            result = await AuthMgr.instance.login(email, password, decodedTokenResultKey);
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
                session.user = result[decodedTokenResultKey];
                delete result[decodedTokenResultKey];
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
    }),
    logout: api.export(async (session) => {
        let result = {
            success: false,
            message: "Not logged in"
        };
        if (session.user && Object.keys(session.user).length > 0) {
            result = {
                success: true,
                data: {
                    username: session.user.username
                },
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
    checkAuth: api.export(async (session) => ({
        success: true,
        user: session.user
    }))
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
