"use strict";

const { BackendProxy: BackendProxyBase } = require("backend");
const BackendDummy = require("./backends/dummy/index");
const Backend = require("./types/backend");

const BackendTypes = {
    dummy: BackendDummy
};

class BackendProxy extends BackendProxyBase {
    constructor() {
        super(Backend);
    }

    async start(config = {}) {
        const backendTypes = Object.assign({}, BackendTypes, config.types);
        await super.start({ types: backendTypes });
    }

    constructUser(user) {
        const instance = this.getBackend(user.backend);

        return instance.constructUser(user);
    }

    async validateUser(backend, event, data) {
        const instance = this.getBackend(backend);

        return instance.validateUser(event, data);
    }

    async lookupUser(data) {
        for (const name of Object.keys(this.backends)) {
            const user = await this.backends[name].lookupUser(data);

            if (user) {
                user.backend = name;

                return user;
            }
        }

        return false;
    }

    async createUser(user) {
        const instance = this.getBackend(user.backend);
        await instance.createUser(user);
    }

    async removeUser(user) {
        const instance = this.getBackend(user.backend);
        await instance.removeUser(user);
    }

    async updateUser(user) {
        const instance = this.getBackend(user.backend);
        await instance.updateUser(user);
    }

    async authenticateUser(user, password) {
        const instance = this.getBackend(user.backend);

        return instance.authenticateUser(user, password);
    }

    async lookupTeam(query) {
        for (const name of Object.keys(this.backends)) {
            const team = await this.backends[name].lookupTeam(query);

            if (team) {
                team.backend = name;

                return team;
            }
        }

        return false;
    }

    async createTeam(team) {
        const instance = this.getBackend(team.backend);
        await instance.createTeam(team);
    }

    async removeTeam(team) {
        const instance = this.getBackend(team.backend);
        await instance.removeTeam(team);
    }

    async updateTeam(team) {
        const instance = this.getBackend(team.backend);
        await instance.updateTeam(team);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
