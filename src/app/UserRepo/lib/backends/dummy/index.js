"use strict";

const { assertType, assertProp } = require("misc");
const argon2 = require("argon2");

const MIN_PASSWORD_LENGTH = 5;

class Dummy {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    _validatePassword(password) {
        assertType(password, "password", "string");
        if (password.length < MIN_PASSWORD_LENGTH) {
            throw new Error(`Password to short, minimum length is ${MIN_PASSWORD_LENGTH}`);
        }
    }

    async _hashPassword(password) {
        const salt = await argon2.generateSalt();
        const hash = await argon2.hash(password, salt);

        return hash;
    }

    async _verifyPassword(passwordHash, password) {
        return argon2.verify(passwordHash, password);
    }

    constructUser(user) {
        // password will be hashed and stored in passwordHash before save in
        // createUser or updateUser
        user.password = user.password;
    }

    async validateUser(event, data) {
        if (event === "create") {
            this._validatePassword(data.password);
        } else if (event === "update") {
            // Do not allow password updates, use setpassword action
            assertProp(data, "password", false);
        }
    }

    async lookupUser(/* data */) {
        return false;
    }

    async createUser(user) {
        if (user.password) {
            user.passwordHash = await this._hashPassword(user.password);
            delete user.password;
        }
    }

    async updateUser(/* user */) {
    }

    async removeUser(/* user */) {
    }

    async authenticateUser(user, password) {
        if (!user.passwordHash) {
            throw new Error("Failed to authenticate user, no password set!");
        }

        return this._verifyPassword(user.passwordHash, password);
    }

    async setPasswordUser(user, newPassword, oldPassword) {
        // Only authenticate if password is set
        if (user.passwordHash) {
            const authenticated = await this.authenticateUser(user, oldPassword);
            if (!authenticated) {
                throw new Error("Cannot set password, athentication failed!");
            }
        }
        this._validatePassword(newPassword);
        user.passwordHash = await this._hashPassword(newPassword);

        return true;
    }

    async lookupTeam(/* query */) {
        return false;
    }

    async createTeam(/* team */) {
    }

    async updateTeam(/* team */) {
    }

    async removeTeam(/* team */) {
    }

    async dispose() {
    }
}

module.exports = Dummy;
