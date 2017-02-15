"use strict";

const MsgBus = require("msgbus");

class ServiceComBus extends MsgBus {
    constructor(config, serviceMgr) {
        const opts = {
            routingKey: serviceMgr.serviceName,
            exchange: {
                name: "servicecom",
                type: "topic",
                options: {
                    durable: true
                }
            },
            queue: {
                name: `${serviceMgr.serviceName}-servicecom`,
                options: {
                    durable: true
                }
            },
            testMode: config.testMode
        };

        super(opts, serviceMgr);
    }

    static get typeName() {
        return "ServiceComBus";
    }
}

module.exports = ServiceComBus;
