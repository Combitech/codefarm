"use strict";

const vm = require("vm");
const moment = require("moment");
const { ServiceMgr } = require("service");
const { assertType, assertProp } = require("misc");
const { Type } = require("typelib");

class Spec extends Type {
    constructor(data) {
        super();

        this.description = "";
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

    run(eventData, stat) {
        const currState = stat.state !== null ? stat.state : this.initialState;

        const sandbox = {
            data: {
                event: eventData,
                newdata: eventData.newdata,
                olddata: eventData.olddata,
                spec: this.serialize(),
                stat: stat.serialize(),
                state: currState
            },
            moment,
            value: null,
            nextState: null,
            fieldNames: null,
            logLines: []
        };

        let result = {
            value: null,
            state: null,
            fieldNames: null
        };

        if (this.script) {
            ServiceMgr.instance.log("debug", `Spec ${this._id} running script`);
            const startTs = Date.now();
            try {
                const opts = {
                    filename: `spec[${this._id}].script`,
                    lineOffset: 0,
                    columnOffset: 0,
                    displayErrors: true
                };
                const script = new vm.Script(this.script, opts);
                script.runInNewContext(sandbox, opts);
                const elapsedMs = Date.now() - startTs;
                result = {
                    value: sandbox.value,
                    state: sandbox.nextState,
                    fieldNames: sandbox.fieldNames
                };
                ServiceMgr.instance.log("verbose", `Spec ${this._id} script finished in ${elapsedMs} ms, result:`, result);
                if (sandbox.logLines && sandbox.logLines.length > 0) {
                    for (const line of sandbox.logLines) {
                        ServiceMgr.instance.log("info", `Spec ${this._id} script logged:`, line);
                    }
                }
            } catch (error) {
                ServiceMgr.instance.log("error", `Spec ${this._id} script throwed error:`, error.message, error.stack);
                throw error;
            }
        }

        return result;
    }
}

module.exports = Spec;
