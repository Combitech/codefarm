"use strict";

const { ServiceMgr } = require("service");
const { Type } = require("typelib");
const singleton = require("singleton");

class Service extends Type {
    constructor(data) {
        super();

        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "service";
    }

    static async _getMb() {
        return ServiceMgr.instance.msgBus;
    }

    /** Implement read operations without database backend.
     * @override
     */
    static async findMany() {
        return [ Service.instance ];
    }

    /** Implement read operations without database backend
     * @override
     */
    static async findOneRaw() {
        return Service.instance;
    }


    static async validate(/* event, data */) {
        throw new Error("Writes not supported");
    }
}

module.exports = singleton(Service);
