"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const RefResolver = require("../resolvers/ref_resolver");

const resolvers = {
    "RefResolve": RefResolver
};

class Data extends Type {
    constructor(data) {
        super();

        this.data = false;
        this.watchRefs = false;
        this.resolver = false;
        this.opts = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "data";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        assertProp(data, "opts", true);
        assertProp(data, "resolver", true);
        assertType(data.resolver, "data.resolver", "string");
        if (!Object.keys(resolvers).includes(data.resolver)) {
            throw new Error(`Unknown resolver ${data.resolver}`);
        }
        assertProp(data, "data", false);
        assertProp(data, "watchRefs", false);
        const resolver = resolvers[data.resolver].instance;
        await resolver.validate(event, data);
    }

    static async factory(data) {
        let obj = await this.findOne({
            resolver: data.resolver,
            opts: data.opts
        });

        if (obj) {
            return obj;
        }

        obj = this._instantiate(data);

        await obj.resolve();
        await obj.save();

        return obj;
    }

    get _resolverInstance() {
        return resolvers[this.resolver].instance;
    }

    async resolve(updatedRef = false) {
        const startTs = Date.now();
        const { data, refs } = await this._resolverInstance.resolve(this, updatedRef);

        this.data = data;
        this.watchRefs = refs;
        const elapsedMs = Date.now() - startTs;
        ServiceMgr.instance.log("verbose", `Resolved ${this._id} in ${elapsedMs}ms (${updatedRef ? "partial" : "full"})`);
    }
}

module.exports = Data;
