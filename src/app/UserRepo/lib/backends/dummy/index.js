"use strict";

class Dummy {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async lookupUser(/* query */) {
        return false;
    }

    async createUser(/* user */) {
    }

    async updateUser(/* user */) {
    }

    async removeUser(/* user */) {
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
