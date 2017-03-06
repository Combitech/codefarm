"use strict";

const api = require("api.io");
const singleton = require("singleton");
const AuthMgr = require("../managers/auth");

const authApiExports = api.register("auth", {
    login: api.export(async (session, email, password) => {
        let result;
        try {
            result = await AuthMgr.instance.login(email, password);
            if (result.success) {
                Object.assign(result, {
                    setCookies: [ {
                        name: result.cookieName,
                        value: result.token,
                        opts: {
                            path: "/"
                        }
                    } ]
                });
            }
        } catch (error) {
            result = {
                success: false,
                message: error.message
            };
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
