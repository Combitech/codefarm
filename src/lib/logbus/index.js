"use strict";

const MsgBus = require("msgbus");

class LogBus extends MsgBus {
    constructor(config, serviceMgr) {
        const opts = {
            noSynchronize: true,
            exchange: {
                name: "log",
                type: "topic",
                options: {
                    durable: true
                }
            }
        };

        if (config) {
            if (config.queue) {
                opts.queue = {
                    name: `${serviceMgr.serviceName}-loglines`,
                    options: {
                        durable: true
                    }
                };
            }

            if (config.testMode) {
                opts.testMode = config.testMode;
            }
        }

        super(opts, serviceMgr);
    }

    static get typeName() {
        return "LogBus";
    }

    async publish(id, time, level, tag, str) {
        return await this.publishRaw({
            _id: id,
            data: {
                time: time,
                level: level,
                tag: tag,
                str: str
            }
        });
    }
}

module.exports = LogBus;
