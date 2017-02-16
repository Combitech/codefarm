"use strict";

const MsgBus = require("msgbus");
const MbClient = require("./mb_client");

let instance;

class ServiceComBus {
    constructor() {
        this.config = {};
        this.clients = {};
        this.msgbus = false;
    }

    static get instance() {
        if (!instance) {
            instance = new this();
        }

        return instance;
    }

    async start(config) {
        this.config = config;

        const opts = {
            uri: config.uri,
            routingKey: config.name,
            noSynchronize: true,
            exchange: {
                name: "servicecom",
                type: "topic",
                options: {
                    durable: true
                }
            },
            queue: {
                name: `${config.name}-servicecom`,
                options: {
                    durable: true
                }
            },
            testMode: config.testMode
        };

        this.msgbus = new MsgBus(opts);

        await this.msgbus.start();
    }

    attachControllers(controllers) {
        if (!this.msgbus) {
            throw new Error("Bus must be connected before controllers can be attached");
        }

        for (const controller of controllers) {
            controller.setMb(this.msgbus);
        }
    }

    getClient(serviceName) {
        return this.clients[serviceName] = (this.clients[serviceName] || new MbClient(serviceName, this.msgbus));
    }

    async dispose() {
        if (this.msgbus) {
            await this.msgbus.dispose();
            this.msgbus = false;
        }

        this.config = {};
        this.clients = {};
    }
}

module.exports = ServiceComBus;
