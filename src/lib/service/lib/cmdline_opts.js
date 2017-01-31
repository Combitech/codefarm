"use strict";

const url = require("url");

const getOpts = (opts = {}) => {
    let format = "amqp://host:port";
    if (!opts.exchangeName) {
        format = `${format}/exchange_name`;
    }
    if (!opts.queueName) {
        format = `${format}/queue_name`;
    }
    const description = `uri to RabbitMQ Bus in format: ${format}`;

    return {
        "bus": {
            demand: true,
            type: "string",
            describe: description,
            coerce: (arg) => {
                const parsed = url.parse(arg);

                // Check that arg is complete
                if (parsed.protocol !== "amqp:") {
                    throw new Error("bus protocol must be amqp");
                }

                let exchangeName = opts.exchangeName;
                let queueName = opts.queueName;

                if (!parsed.pathname && !exchangeName && !queueName) {
                    throw new Error("bus exchange and queue must be given");
                }

                if (parsed.pathname) {
                    const pathnameParts = parsed.pathname.split("/");
                    let partIndex = 1;
                    if (!exchangeName) {
                        exchangeName = pathnameParts[partIndex];
                        partIndex++;
                    }
                    if (!queueName) {
                        queueName = pathnameParts[partIndex];
                        partIndex++;
                    }
                }
                const res = {
                    uri: `${parsed.protocol}//${parsed.host}`,
                    "exchange": {
                        "name": exchangeName,
                        "type": "topic",
                        "options": {
                            "durable": true
                        }
                    },
                    "queue": {
                        "name": queueName,
                        "options": {
                            "durable": true,
                            "exclusive": false
                        }
                    }
                };

                console.log(res);

                if (!res.exchange.name) {
                    throw new Error("bus exchange name must be given");
                }

                if (!res.queue.name) {
                    throw new Error("bus queue name must be given");
                }

                return res;
            }
        }
    };
};

module.exports = getOpts;
