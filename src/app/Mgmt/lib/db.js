"use strict";

const Database = require("database");
const { ServiceError } = require("service");
const { ServiceMgr } = require("service");

let instance;

class Db {
    constructor() {
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async connect(config) {
        this._db = new Database(config, ServiceMgr.instance);

        // Database connect might throw error if DB isn't running yet...
        try {
            await this._db.startBase();
            this._db.once("close", (/* error */) => {
                ServiceMgr.instance.restart("Mongo connection closed, restart");
            });
        } catch (error) {
            throw new ServiceError(error, true);
        }
    }

    async dispose() {
        if (this._db) {
            this._db.removeAllListeners();
            await this._db.dispose();
            this._db = null;
        }
    }

    get db() {
        return this._db;
    }
}

module.exports = Db;
