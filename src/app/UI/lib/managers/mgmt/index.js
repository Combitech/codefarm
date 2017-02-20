"use strict";

const singleton = require("singleton");
const ServiceMonitor = require("./lib/service_monitor");
const EventMonitor = require("./lib/event_monitor");

class Mgmt {
    constructor() {
        this.subscriptions = [];
        this.serviceMonitor = new ServiceMonitor();
        this.eventMonitor = new EventMonitor();
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

module.exports = singleton(Mgmt);
