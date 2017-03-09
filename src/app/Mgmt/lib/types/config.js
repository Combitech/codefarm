"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const { assertType, assertProp } = require("misc");
const Db = require("../db");
const Token = require("../token");

let msgBus = false;
let globalOpts = {};

class Config extends Type {
    constructor(data) {
        super();

        if (data) {
            this.set(data);
        }
    }

    static setMb(mb) {
        msgBus = mb;
    }

    static setGlobalOpts(opts) {
        globalOpts = Object.assign(globalOpts, opts);
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "config";
    }

    static async _getDb() {
        return Db.instance.db;
    }

    static async _getMb() {
        return msgBus;
    }

    static async validate(event, data) {
        // Required to exist
        assertType(data.name, "data.name", "string");

        // Required not to exist
        assertProp(data, "_id", false);
    }

    serialize() {
        const data = super.serialize();

        const token = this.__token;
        delete this.__token;

        return Object.assign(data, globalOpts, {
            token
        });
    }

    async _createToken() {
        const tokenData = {
            src: this.name,
            priv: [ "rwad:*" ]
        };

        this.__token = await Token.instance.create(tokenData);
    }

    static async findMany(...args) {
        const objs = await super.findMany(...args);
        if (objs) {
            for (const obj of objs) {
                await obj._createToken();
            }
        }

        return objs;
    }

    static async findOne(...args) {
        const obj = await super.findOne(...args);
        if (obj) {
            await obj._createToken();
        }

        return obj;
    }
}

Config.disposeGlobals = () => {
    msgBus = false;
    globalOpts = {};
};

module.exports = Config;
