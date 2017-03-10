"use strict";

const jwt = require("jsonwebtoken");
const { assertType } = require("misc");
const singleton = require("singleton");

/*
JWT is configured to use the RS256 algorithm. Use the following commands
to generate a key pair.
$ ssh-keygen -t rsa -b 4096 -f jwtRS256.key
# Don't add passphrase
$ openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

The regular ssh keys are sufficient, but the public key needs to be converted
to the PEM format.
$ openssl rsa -in $HOME/.ssh/id_rsa.pub -pubout -outform PEM -out $HOME/.ssh/id_rsa.pem.pub
*/

const TOKEN_ALGORITHM = "RS256";
const TOKEN_ISSUER = "codefarm";
const ACCESS_WILDCARD = "*";

const TOKEN_TYPE = {
    USER: "usr",
    SERVICE: "service"
};

class Auth {
    constructor() {
    }

    setKeys(keys) {
        if (keys.private) {
            assertType(keys.private, "keys.private", "string");
        }
        if (keys.public) {
            assertType(keys.public, "keys.public", "string");
        }
        this._keys = Object.assign({}, keys);
    }

    async createToken(data, opts, tokenType = TOKEN_TYPE.USER) {
        if (typeof data !== "object" || data === null) {
            throw new Error("Request body must be an object");
        }

        const tokenData = Object.assign({}, data, {
            type: tokenType
        });
        const tokenOpts = Object.assign({
            issuer: TOKEN_ISSUER,
            algorithm: TOKEN_ALGORITHM
        }, opts);

        const token = await this._createToken(tokenData, tokenOpts);

        return {
            token,
            tokenData
        };
    }

    async verifyToken(token, opts) {
        if (typeof token !== "string") {
            throw new Error("token not a string");
        }

        const tokenOpts = Object.assign({
            issuer: TOKEN_ISSUER
        }, opts);

        const decoded = await this._verifyToken(token, tokenOpts);

        return decoded;
    }

    async getKey() {
        return {
            algorithm: TOKEN_ALGORITHM,
            public: this._keys && this._keys.public
        };
    }

    async _createToken(data, opts) {
        let privateKey;
        if (opts && opts.privateKey) {
            privateKey = opts.privateKey;
            delete opts.privateKey;
        } else if (this._keys && this._keys.private) {
            privateKey = this._keys.private;
        } else if (!this._keys) {
            return false;
        }

        if (!privateKey) {
            throw new Error("Missing private key");
        }

        return new Promise((resolve, reject) =>
            jwt.sign(data, privateKey, opts, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        );
    }

    async _verifyToken(data, opts = {}) {
        let publicKey;
        if (opts && opts.publicKey) {
            publicKey = opts.publicKey;
            delete opts.publicKey;
        } else if (this._keys && this._keys.public) {
            publicKey = this._keys.public;
        } else if (!this._keys) {
            return false;
        }

        if (!publicKey) {
            throw new Error("Missing public key");
        }

        return new Promise((resolve, reject) =>
            jwt.verify(data, publicKey, opts, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        );
    }
}

Auth.isTokenValidForAccess = (tokenData, type, accessType = "r") => {
    // TODO: The following code allows unauthorized access. Remove when deployed...
    if (!tokenData) {
        return true;
    }

    // Privileges are in format "acc1,acc2:service.type"
    const privileges = (tokenData && tokenData.priv) || [];
    const [ serviceName, typeName ] = type.split(".");
    const myPriv = privileges.filter((priv) => {
        const [ , privType ] = priv.split(":");
        const [ privService, privTypeName ] = privType.split(".");

        let match = false;
        if (privService === ACCESS_WILDCARD) {
            match = true;
        } else if (privService === serviceName) {
            match = (privTypeName === ACCESS_WILDCARD) || (privTypeName === typeName);
        }

        return match;
    });
    // Extract accesses and put one item per access in a list
    const allowedAccessList = myPriv
        // extract acc1,acc2,... and split to list [ "acc1", "acc2", ... ]
        .map((priv) => priv.split(":")[0].split(","))
        // Flatten list
        .reduce((acc, val) => acc.concat(val), []);
    const allowed = allowedAccessList.includes(ACCESS_WILDCARD) || allowedAccessList.includes(accessType);

    if (!allowed) {
        throw new Error(`Access ${accessType}:${type} denied`);
    }

    return true;
};

Auth.TOKEN_TYPE = TOKEN_TYPE;

module.exports = singleton(Auth);
