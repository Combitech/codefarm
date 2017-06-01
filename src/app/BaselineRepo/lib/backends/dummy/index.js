"use strict";

const { ServiceMgr } = require("service");

class DummyBackend {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async createRepo(repository) {
        ServiceMgr.instance.log("info", `Dummy backend - create repo ${repository._id}`);
    }

    async removeRepo(repository) {
        ServiceMgr.instance.log("info", `Dummy backend - remove repo ${repository._id}`);
    }

    async updateRepo(repository) {
        ServiceMgr.instance.log("info", `Dummy backend - update repo ${repository._id}`);
    }

    async createBaseline(repository, baseline) {
        ServiceMgr.instance.log("info", `Dummy backend - create baseline ${baseline.name} (repo ${repository._id})`);
    }

    async removeBaseline(repository, baseline) {
        ServiceMgr.instance.log("info", `Dummy backend - remove baseline ${baseline.name} (repo ${repository._id})`);
    }

    async updateBaseline(repository, baseline, olddata) {
        ServiceMgr.instance.log("info", `Dummy backend - update baseline ${baseline.name} (repo ${repository._id})`);
    }

    async dispose() {
    }
}

module.exports = DummyBackend;
