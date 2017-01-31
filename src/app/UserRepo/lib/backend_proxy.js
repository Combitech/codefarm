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

    async lookupUser(query) {
        for (const name of Object.keys(this.backends)) {
            const user = await this.backends[name].lookupUser(query);

            if (user) {
                user.backend = name;

                return user;
            }
        }

        return false;
    }

    async createUser(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.createUser(repository);
    }

    async removeUser(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.removeUser(repository);
    }

    async updateUser(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.updateUser(repository);
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

    async createTeam(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.createTeam(repository);
    }

    async removeTeam(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.removeTeam(repository);
    }

    async updateTeam(repository) {
        const instance = this.getBackend(repository.backend);
        await instance.updateTeam(repository);
    }

    async dispose() {
        await super.dispose();
    }
}

module.exports = BackendProxy;
