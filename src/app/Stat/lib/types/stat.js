"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp, synchronize } = require("misc");
const { Type } = require("typelib");
const Spec = require("./spec");
const StatData = require("../stat_data");

class Stat extends Type {
    constructor(data) {
        super();

        this.specRef = false;
        this.lastData = null;
        this.state = null;
        this.fieldNames = null;

        if (data) {
            this.set(data);
        }

        synchronize(this, "update");
        this.__statData = new StatData(`statdata_${this._id}`);
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "stat";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        if (event === "create") {
            assertProp(data, "_id", true);
            assertType(data.specRef, "data.specRef", "ref");
            assertType(data.fieldNames, "data.fieldNames", "array");
        } else if (event === "update") {
            // Update
        }
    }

    async _removeHook() {
        await this.__statData.destroy();
    }

    async update(triggerRef, eventData) {
        const spec = await Spec.findRef(this.specRef);
        if (!spec) {
            throw new Error(`Can't resolve specRef ${JSON.stringify(this.specRef)}`);
        }

        const { value, state, fieldNames } = spec.run(eventData, this);

        let updated = false;
        if (state !== null) {
            this.state = state;
            updated = true;
        }

        if (fieldNames !== null) {
            this.fieldNames = fieldNames;
            updated = true;
        }

        if (value !== null) {
            this.lastData = await this.__statData.add(triggerRef, value);
            updated = true;
        }

        if (updated) {
            ServiceMgr.instance.log("verbose",
                `Stat ${this._id} updated, triggered by ${triggerRef.type}:${triggerRef.id} - ` +
                `data: ${JSON.stringify(this.lastData)}, state: ${JSON.stringify(this.state)}`
            );
            await this.save();
        }

        return updated;
    }

    async getInfo(fields = false, opts = {}) {
        // If no fields given, try to get info for all
        if (fields === false) {
            fields = this.fieldNames;
        }

        if (!fields || fields.length === 0) {
            return [];
        }

        return this.__statData.calcCharacteristics(fields, opts);
    }

    async getSamples(fields = false, opts = {}) {
        // If no fields given, try to get info for all
        if (fields === false) {
            fields = this.fieldNames || [];
        }

        if (!fields || fields.length === 0) {
            return [];
        }

        return this.__statData.getSamples(fields, opts);
    }
}

module.exports = Stat;
