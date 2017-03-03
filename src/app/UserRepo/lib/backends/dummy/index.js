"use strict";

const { assertType } = require("misc");

const MIN_PASSWORD_LENGTH = 8;

class Dummy {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async hashPassword(password) {
        // TODO: Use real hashing algorithm...
        return `Hashed ${password}`;
    }

    constructUser(user) {
        // password will be hashed and stored in passwordHash before save in
        // createUser or updateUser
        user.password = user.password;
    }

    async validateUser(event, data) {
        if (event === "create") {
            assertType(data.password, "data.password", "string");
            if (data.password.length < MIN_PASSWORD_LENGTH) {
                throw new Error(`Password to short, minimum length is ${MIN_PASSWORD_LENGTH}`);
            }
        }
    }

    async lookupUser(/* data */) {
        return false;
    }

    async createUser(user) {
        if (user.password) {
            user.passwordHash = await this.hashPassword(user.password);
            delete user.password;
        }
    }

    async updateUser(user) {
        if (user.password) {
            user.passwordHash = await this.hashPassword(user.password);
            delete user.password;
        }
    }

    async removeUser(/* user */) {
    }

    async authenticateUser(user, password) {
        const passwordHash = await this.hashPassword(password);

        return user.passwordHash === passwordHash;
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
