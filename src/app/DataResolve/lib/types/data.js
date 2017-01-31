"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");
const Resolver = require("../resolver");

class Data extends Type {
    constructor(data) {
        super();

        this.ref = false;
        this.spec = false;
        this.data = false;
        this.watchRefs = false;

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
        assertProp(data, "ref", true);
        assertType(data.ref, "data.ref", "object");
        assertProp(data, "data", false);
        assertProp(data, "watchRefs", false);
    }

    static async factory(data) {
        let obj = await this.findOne({
            ref: data.ref,
            spec: data.spec
        });

        if (obj) {
            return obj;
        }

        obj = this._instantiate(data);

        await obj.resolve();
        await obj.save();

        return obj;
    }

    async resolve(updatedRef = false) {
        const startTs = Date.now();
        const { data, refs } = await Resolver.instance.resolve(this.ref, this.spec, this.data, updatedRef, this._id);

        this.data = data;
        this.watchRefs = refs;
        const elapsedMs = Date.now() - startTs;
        ServiceMgr.instance.log("verbose", `Resolved ${this._id} in ${elapsedMs}ms (${updatedRef ? "partial" : "full"})`);
    }
}

module.exports = Data;
