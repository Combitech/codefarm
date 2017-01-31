"use strict";

const ServiceMonitor = require("./lib/service_monitor");
const EventMonitor = require("./lib/event_monitor");

let instance;

class Mgmt {
    constructor() {
        this.subscriptions = [];
        this.serviceMonitor = new ServiceMonitor();
        this.eventMonitor = new EventMonitor();
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start() {
        await this.serviceMonitor.start();
        await this.eventMonitor.start();
    }

    getServiceMonitorBusListener() {
        return this.serviceMonitor.mgmtBusListener.bind(this.serviceMonitor);
    }

    getEventMonitorBusListener() {
        return this.eventMonitor.busListener.bind(this.eventMonitor);
    }

    async dispose() {
        await this.serviceMonitor.dispose();
        await this.eventMonitor.dispose();
    }
}

module.exports = Mgmt;
