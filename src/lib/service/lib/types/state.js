"use strict";

const { Type } = require("typelib");
const { assertType } = require("misc");

/* Keep reference to ServiceMgr instance in order to get rid of
 * circular dependency that would happen if we were to
 * require manager in this file. */
let serviceMgr;

// There can be only one state per service...
let instance;

class State extends Type {
    constructor(data) {
        super();

        if (data) {
            this.set(data);
        }
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    static async validate(event, data) {
        assertType(data.state, "data.state", "string");
        assertType(data.uses, "data.uses", "object");
        assertType(data.provides, "data.provides", "object");
    }

    static setManager(mgr) {
        serviceMgr = mgr;
    }

    static get serviceName() {
        return serviceMgr.serviceName;
    }

    static get typeName() {
        return "state";
    }

    static async _getMb() {
        return serviceMgr.msgBus;
    }

    /** Implement read operations without database backend.
     * Since every service only has one state the implementation is trivial.
     * @override
     */
    static async findMany() {
        return [ instance ];
    }

    /** Implement read operations without database backend
     * Since every service only has one state the implementation is trivial.
     * @override
     */
    static async findOne() {
        return instance;
    }

    /** Restart service
     * @public
     * @return {undefined}
     */
    restart(...args) {
        return serviceMgr.restart(...args);
    }

    /** Distributes a snapshot event which only sets newdata
     * @public
     * @param {Array} parentIds Parent ids
     * @return {Object} message sent
     */
    async notifyUpdate(parentIds = []) {
        return this.notifyEvent("snapshot", null, this.serialize(), parentIds);
    }
}

module.exports = State;
