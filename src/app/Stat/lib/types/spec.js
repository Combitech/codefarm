"use strict";

const vm = require("vm");
const moment = require("moment");
const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Spec extends Type {
    constructor(data) {
        super();

        this.description = false;
        this.initialState = null;
        this.script = false;
        if (data) {
            this.set(data);
        }
    }

    static get serviceName() {
        return ServiceMgr.instance.serviceName;
    }

    static get typeName() {
        return "spec";
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
        } else if (event === "update") {
            // Update
        }

        if (data.hasOwnProperty("description")) {
            assertType(data.description, "data.description", "string");
        }
    }

    async run(eventData, stat) {
        const currState = stat.state !== null ? stat.state : this.initialState;

        const sandbox = {
            data: {
                event: eventData.event,
                newdata: eventData.newdata,
                olddata: eventData.olddata,
                spec: this.serialize(),
                stat: stat.serialize(),
                state: currState
            },
            moment,
            value: null,
            nextState: null
        };

        let result = {
            value: null,
            state: null
        };

        if (this.script) {
            ServiceMgr.instance.log("debug", `Spec ${this._id} running script`);
            const startTs = Date.now();
            const script = new vm.Script(this.script);
            script.runInNewContext(sandbox);
            const elapsedMs = Date.now() - startTs;
            result = {
                value: sandbox.value,
                state: sandbox.nextState
            };

            ServiceMgr.instance.log("verbose", `Spec ${this._id} script finished in ${elapsedMs} ms, result:`, result);
        }

        return result;
    }
}

module.exports = Spec;
