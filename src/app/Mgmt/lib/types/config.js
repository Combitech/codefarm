"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const { assertType, assertProp } = require("misc");
const Db = require("../db");
const Auth = require("auth");

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

    static async createToken(name) {
        const tokenData = {
            src: name,
            priv: [ "*:*" ]
        };

        const { token } = await Auth.instance.createToken(tokenData, {}, Auth.TOKEN_TYPE.SERVICE);

        return token;
    }

    static async findMany(...args) {
        const objs = await super.findMany(...args);
        if (objs) {
            for (const obj of objs) {
                obj.__token = await obj.constructor.createToken(obj.name);
            }
        }

        return objs;
    }

    static async findOne(...args) {
        const obj = await super.findOne(...args);
        if (obj) {
            obj.__token = await obj.constructor.createToken(obj.name);
        }

        return obj;
    }
}

Config.disposeGlobals = () => {
    msgBus = false;
    globalOpts = {};
};

module.exports = Config;
