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

class Token {
    constructor() {
    }

    setKeys(keys) {
        assertType(keys.private, "keys.private", "string");
        assertType(keys.public, "keys.public", "string");
        this._keys = Object.assign({}, keys);
    }

    async create(data, opts) {
        if (typeof data !== "object" || data === null) {
            throw new Error("Request body must be an object");
        }

        const tokenData = Object.assign({}, data);
        const tokenOpts = Object.assign({
            issuer: "codefarm",
            algorithm: TOKEN_ALGORITHM
        }, opts);

        const token = await this._createToken(tokenData, tokenOpts);

        return token;
    }

    async verify(token, opts) {
        if (typeof token !== "string") {
            throw new Error("token not a string");
        }

        const tokenOpts = Object.assign({
            issuer: "codefarm"
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
        if (!this._keys) {
            return false;
        }

        return new Promise((resolve, reject) =>
            jwt.sign(data, this._keys.private, opts, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        );
    }

    async _verifyToken(data, opts = {}) {
        if (!this._keys) {
            return false;
        }

        return new Promise((resolve, reject) =>
            jwt.verify(data, this._keys.public, opts, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            })
        );
    }
}

module.exports = singleton(Token);
