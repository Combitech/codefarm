"use strict";

const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Claim extends Type {
    constructor(data) {
        super();

        this.text = false;
        this.creatorRef = false;
        this.targetRef = false;

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "claim";
    }

    static async _getDb() {
        return await ServiceMgr.instance.use("db");
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    static async validate(event, data) {
        assertProp(data, "_id", false);
        if (event === "create") {
            assertType(data.text, "data.text", "string");
            assertType(data.creatorRef, "data.creatorRef", "ref");
            if (data.targetRef) {
                assertType(data.targetRef, "data.targetRef", "ref");
            }
        } else if (event === "update") {
            if (data.text) {
                assertType(data.text, "data.text", "string");
            }
            if (data.creatorRef) {
                assertType(data.creatorRef, "data.creatorRef", "ref");
            }
            if (data.targetRef) {
                assertType(data.targetRef, "data.targetRef", "ref");
            }
        }
    }
}

module.exports = Claim;
