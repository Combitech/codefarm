"use strict";

/* global describe it after before */

const { assert } = require("chai");
const rp = require("request-promise");
const getPort = require("get-port");
const { serviceMgr } = require("service");
const Main = require("../lib/main");

"use strict";

class TestBackend {
    constructor(name, params) {
        this.name = name;
        this.params = params;
    }

    async start() {
    }

    async lookupUser(/* query */) {
        return false;
    }

    async createUser(user) {
        user.testBackendCreateTouch = true;
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


describe("UserRepo", () => {
    let testInfo;
    let main;
    let baseUrl;

    const backend1 = {
        _id: "Dummy",
        backendType: "dummy"
    };

    const addBackend = async (data) =>
        rp.post({
            url: `${baseUrl}/backend`,
            body: data,
            json: true
        });

    const listUsers = async () =>
        rp({
            url: `${baseUrl}/user`,
            json: true
        });

    const addUser = async (data) =>
        rp.post({
            url: `${baseUrl}/user`,
            body: data,
            json: true
        });

    const listTeams = async () =>
        rp({
            url: `${baseUrl}/team`,
            json: true
        });

    const addTeam = async (data) =>
        rp.post({
            url: `${baseUrl}/team`,
            body: data,
            json: true
        });

    before(async () => {
        testInfo = {
            name: "userrepo",
            version: "0.0.1",
            config: {
                autoUseMgmt: false,
                level: "info",
                bus: {
                    testMode: true
                },
                db: {
                    testMode: true,
                    name: "MyDB"
                },
                web: {
                    port: await getPort()
                },
                backends: {
                    types: {
                        "test_backend": TestBackend
                    }
                },
                servicecom: {
                    testMode: true
                }
            }
        };

        baseUrl = `http://localhost:${testInfo.config.web.port}`;

        main = new Main(testInfo.name, testInfo.version);
        serviceMgr.create(main, testInfo.config);
        await main.awaitOnline();
        await addBackend(backend1);
    });

    after(async () => {
        await serviceMgr.dispose();
    });

    const backend2 = {
        _id: "TestOnly",
        backendType: "test_backend"
    };

    const user1 = {
        _id: "test1",
        name: "test user"
    };

    const user2 = {
        _id: "test2",
        name: "test user",
        backend: backend2._id
    };

    const team1 = {
        _id: "team1",
        name: "test team"
    };

    describe("User REST API", () => {
        it("should initially list zero users", async () => {
            const data = await listUsers();
            assert.equal(data.length, 0);
        });

        it("should add user", async () => {
            const data = await addUser(user1);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data._id, user1._id);
            assert.strictEqual(data.data.name, user1.name);
        });

        it("should list user", async () => {
            const data = await listUsers();
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, user1._id);
            assert.strictEqual(data[0].name, user1.name);
        });

        it("should not add user to unknown backend", async () => {
            const testUser = {
                _id: "failedTestUser",
                name: "failed test user",
                backend: "NonExistingBackend"
            };

            try {
                await addUser(testUser);
                assert(false, "Unexpected user add");
            } catch (error) {
                console.log(error);
                assert.strictEqual(error.statusCode, 500);
                assert.match(error.message, /Unknown backend name NonExistingBackend/);
            }
        });

        it("should add user to test backend", async () => {
            await addBackend(backend2);
            const data = await addUser(user2);
            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data._id, user2._id);
            assert.strictEqual(data.data.name, user2.name);
            assert.strictEqual(data.data.backend, user2.backend);
            assert.strictEqual(data.data.testBackendCreateTouch, true);
        });
    });

    describe("Team REST API", () => {
        it("should initially list zero teams", async () => {
            const data = await listTeams();
            assert.equal(data.length, 0);
        });

        it("should add team", async () => {
            const data = await addTeam(team1);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data._id, team1._id);
            assert.strictEqual(data.data.name, team1.name);
        });

        it("should list team", async () => {
            const data = await listTeams();
            assert.equal(data.length, 1);
            assert.strictEqual(data[0]._id, team1._id);
            assert.strictEqual(data[0].name, team1.name);
        });
    });

    const user3 = {
        _id: "test3",
        name: "test user 3",
        teams: [ team1._id ]
    };

    describe("User with team", () => {
        it("should add user", async () => {
            const data = await addUser(user3);

            assert.strictEqual(data.result, "success");
            assert.strictEqual(data.data._id, user3._id);
            assert.strictEqual(data.data.name, user3.name);
            assert.deepEqual(data.data.teams, user3.teams);
        });

        it("should not add user with unexisting team", async () => {
            const testUser = {
                _id: "failedTestUser",
                name: "failed test user",
                teams: [ "some_non_existing_team" ]
            };
            try {
                await addUser(testUser);
                assert(false, "Unexpected user add");
            } catch (error) {
                console.log(error);
                assert.strictEqual(error.statusCode, 400);
                assert.match(error.message, /Team some_non_existing_team doesn't exist/);
            }
        });
    });
});
