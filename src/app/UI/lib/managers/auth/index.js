"use strict";

const singleton = require("singleton");
const { ServiceMgr } = require("service");
const { ServiceComBus } = require("servicecom");
const { ensureArray } = require("misc");

const TOKEN_EXPIRES_IN = "5 days";

class Auth {
    constructor() {
    }

    get cookieName() {
        return this._cookieName;
    }

    get publicKey() {
        return this._publicKey;
    }

    async start(config) {
        if (config.web.auth) {
            this._cookieName = config.web.auth.jwtCookieName;
        }

        this._publicKey = config.publicKey;
        if (this._publicKey) {
            ServiceMgr.instance.log("info", "JWT public key setup");
        }
    }

    async dispose() {
        this._privateKey = null;
    }

    async _getUserPrivileges(user) {
        const client = ServiceComBus.instance.getClient("userrepo");
        const policyIds = user.policyRefs
            .map((ref) => ensureArray(ref.id))
            .reduce((acc, val) => acc.concat(val), []);
        let policies = [];
        if (policyIds.length > 0) {
            policies = await client.list("policy", {
                _id: {
                    $in: policyIds
                }
            });
        }

        // Get all privileges from policies and remove duplicates
        const privileges = policies
            .map((policy) => policy.privileges)
            .reduce((acc, val) => acc.concat(val), [])
            .filter((priv, index, self) => self.indexOf(priv) === index);

        return privileges;
    }

    async login(emailOrId, password) {
        if (typeof emailOrId !== "string") {
            throw new Error("emailOrId required");
        }

        if (emailOrId.length === 0) {
            throw new Error("emailOrId of non-zero length required");
        }

        if (typeof password !== "string") {
            throw new Error("password required");
        }

        const client = ServiceComBus.instance.getClient("userrepo");
        // Get user with email or _id
        const users = await client.list("user", {
            $or: [
                { _id: emailOrId },
                { email: emailOrId }
            ]
        });
        if (!(users instanceof Array)) {
            throw new Error(`Expected array result, got data: ${JSON.stringify(users)}`);
        }
        let authenticated = false;
        if (users.length === 1) {
            // TODO: Secure communication below!
            const authResponse = await client.call("auth", "user", users[0]._id, { password });
            authenticated = authResponse.authenticated;
        }

        let result;

        if (authenticated) {
            const user = users[0];
            const priv = await this._getUserPrivileges(user);
            const tokenData = {
                id: user._id,
                username: user.name,
                priv
            };
            const tokenOpts = {
                expiresIn: TOKEN_EXPIRES_IN
            };
            const createResp = await this._createToken(tokenData, tokenOpts);

            if (createResp) {
                result = {
                    success: true,
                    token: createResp.token,
                    tokenData: createResp.tokenData
                };
            } else {
                result = {
                    success: false,
                    message: "Server failed to create token"
                };
            }
        } else {
            result = {
                success: false,
                message: "Invalid username or password"
            };
        }

        return result;
    }

    async _createToken(data) {
        const client = ServiceComBus.instance.getClient("mgmt");

        return client.createtoken("service", "", data);
    }
}

module.exports = singleton(Auth);
